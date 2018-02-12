var express = require("express"),
    mongoose = require("mongoose"),
    ejs = require("ejs"),
    request = require("request"),
    bodyParser = require("body-parser"),
    Campground = require("./models/campground"),
    Comment   = require("./models/comment"),
    date = require('date-and-time'),
    seedDB = require('./seeds'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    methodOverride = require('method-override'),
    flash = require('connect-flash');

var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes = require('./routes/comments'),
    indexRoutes = require('./routes/index'),
    userRoutes = require('./routes/users');

var app = express();

mongoose.connect(process.env.OZCAMP_DATABASE_URL);

app.set("view engine", "ejs");
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(require('express-session')({
  secret: "Bananas are delicious though nothing beats mangoes",
  resave: false,
  saveUninitialized: false
}));
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.message = req.flash();
  next();
});

app.use(methodOverride("_method"));
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT, function(req, req){
  console.log("OzCamp app started!!");
});

app.get("/landing", function(req,res){
  res.render("landing");
});
