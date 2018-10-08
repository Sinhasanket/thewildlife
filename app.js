var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSanitizer      = require("express-sanitizer"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
   // flash                 =require("connect-flash"),
    //multer                = require("multer"),
   // cloudinary            = require("cloudinary"),
    Wild                  = require("./model/wild"),
    User                  = require("./model/user");
   // middleware             = require("./middleware/index.js");

var url = process.env.DATABASEURL || "mongodb://localhost/wildlife"
mongoose.connect(url);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// passport config
app.use(require("express-session")({
    secret: "Learn programming daily",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// routes
app.get("/", function(req, res){
   res.render("home"); 
});

app.get("/about", function(req, res){
    res.render("about");
})

app.get("/wilds", function(req, res){
    Wild.find({}, function(err, wilds){
        if(err){
            console.log("ERROR!");
        } else {
             res.render("index", {wilds: wilds});
        }
    });
});


//multer config
// const storage = multer.diskStorage({
//   filename: function(req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   }
// });
// const imageFilter = (req, file, cb) => {
//     // accept image files only
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
//         return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
// };
// var upload = multer({ storage: storage, fileFilter: imageFilter});

app.get("/wilds/new", isLoggedIn, function(req, res){
   res.render("new"); 
});

app.post("/wilds", function(req, res){
  req.body.wild.body = req.sanitize(req.body.wild.body)
  Wild.create(req.body.wild,  function(err, newWild){
      if(err){
          res.render("new");
    
      } else {
          res.redirect("/wilds");
      }
  }); 
});

app.get("/wilds/:id", function(req, res){
   Wild.findById(req.params.id, function(err, foundWild){
       if(err){
           res.redirect("/wilds");
       } else{
           res.render("show",{wild: foundWild});
       }
   }) 
});

app.get("/wilds/:id/edit", isLoggedIn, function(req, res){
    Wild.findById(req.params.id, function(err, foundWild){
       if(err){
           res.redirect("/wilds");
       } else {
           res.render("edit", {wild: foundWild});
       }
    });
});

app.put("/wilds/:id", isLoggedIn,function(req, res){
   req.body.wild.body = req.sanitize(req.body.wild.body)
   Wild.findByIdAndUpdate(req.params.id, req.body.wild, function(err, updatedWild){
      if(err){
          res.redirect("/wilds");
      }  else {
          res.redirect("/wilds/" + req.params.id);
      }
   });
});

app.delete("/wilds/:id", isLoggedIn,function(req, res){
    Wild.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/wilds");
       } else {
           res.redirect("/wilds")
       }
    });
});

//auth routes
app.get("/register", function(req, res){
  res.render("register"); 
});

app.post("/register", function(req, res){
    req.body.username
    req.body.password
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
            passport.authenticate("local")(req, res, function(){
              res.redirect("/wilds"); 
            });
    });
});

//handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err)
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/wilds"); 
        });
    });
});


//LOGIN ROUTE
app.get("/login", function(req, res){
  res.render("login"); 
});
//login logic
//middleware
app.post("/login",passport.authenticate("local", {
  successRedirect: "/wilds",
  failureRedirect: "/login"
}), function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("server is on...."); 
});