require('dotenv').config();
const express = require("express");
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate =require("mongoose-findorcreate")

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("Public"));
app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: "my secret file",
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect('mongodb://127.0.0.1:27017/userDb', {
    useNewUrlParser: true
}, {
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId:String,
    secret:String
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) { 
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get('/', (req, res) => {
    res.render("home")
})
app.get('/login', (req, res) => {
    res.render("login")
})
//updated code
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
app.get('/register', (req, res) => {
    res.render("register")
})
app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile"] }));

    app.get('/auth/google/secrets', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/secrets');
    });
app.get('/secrets',(req,res)=>{
   User.find({"secret":{$ne:null}},function(err,foundUsers){
    if(err){
        console.log(err);
    }
    else{
        if(foundUsers){
            res.render("secrets",{userWithSecrets:foundUsers})
        }
    }
   })
})
app.get('/submit',(req,res)=>{
    if(req.isAuthenticated){
        res.render('submit')
    }else{
        res.redirect('login')
    }
})
app.post('/submit',(req,res)=>{
    const submittedSecret=req.body.secret;
    User.findById(req.user.id,(err,foundUser)=>{
        if(err){
        }else{
            if(foundUser){
                foundUser.secret=submittedSecret;
            foundUser.save(()=>{
                res.redirect('secrets');
            })
            }
        }
    })
})
app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  });

app.post("/login", (req, res) => {
    const user = new User({
        username:req.body.username,
        password:req.body.password
    })
    req.login(user,(err)=>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,()=>{
                res.render('secrets');
            })
        }
    })
})
app.listen(3000, () => {
    console.log("server started on 3000")
})