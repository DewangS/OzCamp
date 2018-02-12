var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//to show New comment form
router.get("/new", middleware.isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      res.render("error");
    }
    else {
      res.render("comments/new.ejs", {campground: campground});
    }
  });

});


//To insert\add a new comment
router.post("/", function(req, res){

  var commentText = req.body.comment;

      Campground.findById(req.params.id, function(err, campground){
        if (err) {
          console.log("Can't find the campground "+err);
          res.render("error", {message: "Can't find the campground."});
        }
        else {
          Comment.create(commentText, function(err, newComment){
            if (err) {
                console.log("Error creating new comment"+err);
                req.flash("danger", "Error adding your comment. Please try again.");
            }
            else
            {
              newComment.author.id = req.user._id;
              newComment.author.username = req.user.username;
              newComment.save();
              campground.comments.push(newComment._id);
              campground.save();
              req.flash("success", "Successfully added your comment.");
              res.redirect("/campgrounds/"+campground._id);
            }
          })
        }
      })
  });

//To edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
  Comment.findById(req.params.comment_id, function(err, comment){
      if (err || !comment) {
        console.log("Unable to find the comment");
        req.flash("danger", "Unable to find the comment.")
      }
      else {
          res.render("comments/edit", {comment: comment, campground_id: req.params.id});
      }
  });
});

//To update comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  console.log("Updating comment id : "+req.params.comment_id + " comment : "+req.body.comment);
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
      if (err) {
        console.log("Unable to update the comment");
        req.flash("danger", "Unable to update the comment.")
      }
      else {
        req.flash("success", "Successfully updated your comment.");
        res.redirect("/campgrounds/"+req.params.id);
      }
  });
});

//To delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
      console.log("Deleted comment");
      req.flash("success", "Successfully deleted your comment.");
      res.redirect("back");
  });
});

module.exports = router;
