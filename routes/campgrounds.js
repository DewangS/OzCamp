var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');
var geocoder = require('geocoder');

// to display campgrounds
router.get("/", function(req,res){
  var noMatch="";
  if (req.query.search) {
    const regx = new RegExp(escapeRegx(req.query.search), "gi");
    Campground.find({name: regx}, function(err,campgrounds){
      if (err) {
        console.log("An error occured to retrieve campgrounds");
        req.flash("danger", "An error occured to retrieve campgrounds");
        res.redirect("/");
      }
      else {
        if (campgrounds.length < 1) {
          noMatch = "No campground match that query, please try again."
        }
        res.render("campgrounds/index", {campgrounds: campgrounds, noMatch: noMatch, page: 'campgrounds'});
      }
    });
  }
  else {
    Campground.find({}, function(err,campgrounds){
      if (err) {
        console.log("An error occured to retrieve campgrounds");
        req.flash("danger", "An error occured to retrieve campgrounds");
        res.redirect("/");
      }
      else {
        res.render("campgrounds/index", {campgrounds: campgrounds, noMatch: noMatch, page: 'campgrounds'});
      }
    });
  }

  //res.render("campgrounds", {campgrounds: campgrounds});
});

//to show new campground data entry form
router.get("/new", middleware.isLoggedIn, function(req, res){
  res.render("campgrounds/new.ejs");
});

//to add a new campground to the database
router.post("/", middleware.isLoggedIn, function(req, res){
  var name = req.body.campground.name;
  var price = req.body.campground.price;
  var imageurl = req.body.campground.image;
  var description = req.body.campground.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var campground = {name: name, price: price, image: imageurl, description: description, author: author};
  Campground.create(campground, function(err, campground){
                      if (err) {
                        console.log("An error occured while trying to create a new campground record.");
                        req.flash("danger", "An error occured to create a campground.");
                      }
                    });
  req.flash("success", "Successfully added campground details.");
  res.redirect("/campgrounds")
});

//to retrieve and present user selected campground details
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
      if (err || !campground) {
        req.flash("danger", "Unable to retrieve the campground.");
        res.redirect("/campgrounds")
      }
      else {
        res.render("campgrounds/show", {campground: campground});
      }
    });
});

//to show campground data edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if (err || !campground) {
      req.flash("danger", "Unable to retrieve the campground.");
      res.redirect("/campgrounds")
    }
    else
      res.render("campgrounds/edit", {campground: campground});
  });
});

//update the database with updated campground details
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
    if (err) {
      req.flash("danger", "Unable to update campground details. Please try again.")
    }
    else {
      req.flash("success", "Successfully updated campground details.");
      res.redirect("/campgrounds/"+campground._id);
    }

  });
});

//delete campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
      req.flash("success", "Successfully deleted campground details.")
      res.redirect("/campgrounds");
  });
});

function escapeRegx(text) {
    return text.replace(/[-[\]{}*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
