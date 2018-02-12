var express = require('express');
var router = express.Router();
var passport = require('passport'),
    User = require('../models/user'),
    Campground = require('../models/campground');;
var OZCAMP_SECRET_CODE = process.env.OZCAMP_SECRET_CODE;

//root page
router.get("/:id", function(req, res){
  console.log("UserID : "+req.params.id);
  User.findById(req.params.id, function(err, foundUser){
    if (err || !foundUser) {
      req.flash("warning", "Unable to find the user details.");
      res.redirect("back");
    }
    else {
      Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
        if (err) {
          req.flash("warning", "Error while trying to find campgrounds.");
          res.redirect("back");
        }
        res.render("users/show", {user: foundUser, campgrounds: campgrounds});
      });

    }
  });

});

module.exports = router;
