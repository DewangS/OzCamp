var express = require('express');
var router = express.Router();
var passport = require('passport'),
    User = require('../models/user');
var OZCAMP_SECRET_CODE = process.env.OZCAMP_SECRET_CODE;
var async = require('async'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto');
//root page
router.get("/", function(req, res){
  res.redirect("/landing");
});

// to display registration page for new user
router.get("/register", function(req, res){
  res.render("register", {page: 'register'});
});

//to add a new user to the database
router.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  newUser.firstName = req.body.firstName;
  newUser.lastName = req.body.lastName;
  newUser.email = req.body.email;
  newUser.avatar = req.body.avatar;
  newUser.about = req.body.about;
  if (req.body.adminCode === OZCAMP_SECRET_CODE) {
    newUser.isAdmin = true;
  }
  console.log(JSON.stringify(req.body));
  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      req.flash("danger", "Unable to register."+err.message);
      res.redirect("register");
    }
    else {
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Successfully registerd. Welcome, "+user.username + " to OzCamp.");
        res.redirect("/campgrounds");
      });
    }

  });
});

//to display the login page
router.get("/login", function(req, res){
  if(req.headers.referer && !!req.headers.referer.match(/\/campgrounds\/[a-z\d]{24}/i)) {
      req.session.returnTo = req.headers.referer;
    }
    res.render("login", {page: 'login'});
});

//to login the user based on the username\password
router.post("/login", function (req, res, next) {
    passport.authenticate("local",
        {
            successReturnToOrRedirect: "/campgrounds",
            failureRedirect: "/login",
            successFlash: "Welcome to OzCamp, " + req.body.username + "!",
            failureFlash: true
        })(req, res);
});

//to logout the user
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "You have successfully logged out!!");
  res.redirect("/campgrounds");
});

//for password reset
router.get("/forgot", function(req, res){
  res.render("forgot")
});

router.post("/forgot", function(req, res){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf){
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({email: req.body.email}, function(err, user){
        if (err || !user) {
          req.flash('danger', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(function(err){
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.OZCAMP_RESET_PWORD_EMAIL,
          pass: process.env.OZCAMP_RESET_PWORD_PASS
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'webdevelopment549@gmail.com',
        subject: 'OzCamp password reset',
        html: '<p>You are receiving this email because you (or someone else) have requested the reset of the password ' +
        'Please click on the below link or copy and paste this in to your browser to complete the process\n</p>' +
        ' http://'+ req.headers.host + '/reset/' + token + '\n\n' +
        "<p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>"
      };
      smtpTransport.sendMail(mailOptions, function(err){
        console.log('mail sent');
        req.flash('info', 'An email has been sent to '+ user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err){
    if (err) {
      return next(err);
    }
    res.redirect("/forgot");
  });
});

router.get("/reset/:token", function(req, res){
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
    if (!user) {
      req.flash('danger', 'Password reset token is invalid or expired.');
      return res.redirect("/forgot");
    }
    res.render('reset', {token: req.params.token});
  })
});

router.post("/reset/:token", function(req, res){
  async.waterfall([
    function(done){
      User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if (!user) {
          req.flash('danger', 'Password reset token is invalid or expired.');
          return res.redirect("back");
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err){
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err){
              req.logIn(user, function(err){
                done(err, user);
              });
            });
          });
        }
        else {
          req.flash("warning", "Passwords do not match.");
          return res.redirect('back');
        }
      });
    },
    function(user, done){
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'webdevelopment549@gmail.com',
          pass: 'nodedeveloper'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'webdevelopment549@gmail.com',
        subject: 'OzCamp password reset confirmation',
        html: '<p> This is a confirmation that your password for ' + user.email + " has just been reset.</p>"
      };
      smtpTransport.sendMail(mailOptions, function(err){
        console.log('success mail sent');
        req.flash('info', 'Your password has been reset.');
        done(err);
      });
    }
  ], function(err){
    res.redirect("/campgrounds");
    });
});

module.exports = router;
