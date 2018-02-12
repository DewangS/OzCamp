var middlewareObj = {};
var Campground = require('../models/campground');
var Comment = require('../models/comment');

middlewareObj.checkCampgroundOwnership = function(req, res, next){
      if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, campground){
          if (err || !campground) {
            console.log("An error occured while trying to find the campground..."+err);
            res.render("error", {msg: "An error occured while trying to find the campground..."});
          }
          else {
            if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
              if (campground) {
                return next();
              }
              else {
                return res.redirect("back");
              }
            }
            else {
              var msg = "You are not authorized to perform this operation.";
              req.flash("danger", msg);
              res.redirect("/campgrounds/"+req.params.id);
            }
          }
        });
      }
      else {
        req.flash("danger", "You need to be logged in to do that.");
        res.redirect("/login");
      }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, comment){
      if (err || !comment) {
        console.log("An error occured while trying to find the coment..."+err);
        res.render("error", {msg: "An error occured while trying to find the comment..."});
      }
      else {
        if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
          return next();
        }
        else {
          var msg = "You are not authorized to perform this operation.";
          req.flash("danger", msg);
          res.redirect("/campgrounds/"+req.params.id);
        }
      }
    });
  }
  else {
    req.flash("danger", "You need to be logged in to do that.");
    res.redirect("/login");
  }
};

middlewareObj.isLoggedIn = function(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    req.session.returnTo = req.originalUrl;
    req.flash("danger", "You need to be logged in to do that.");
    res.redirect("/login");
  }
};

module.exports = middlewareObj;
