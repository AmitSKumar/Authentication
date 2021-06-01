require('dotenv').config();
const express = require("express");
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const { Passport } = require('passport');


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
    password: String
})
userSchema.plugin(passportLocalMongoose)
const User = mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get('/', (req, res) => {
    res.render("home")
})
app.get('/login', (req, res) => {
    res.render("login")
})
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
app.get('/register', (req, res) => {
    res.render("register")
})

app.get('/secrets',(req,res)=>{
    if(req.isAuthenticated){
        res.render('secrets')
    }else{
        res.redirect('/login')
    }
})
app.post('/register', (req, res) => {
    User.register({username:req.body.username},req.body.password,(err,user)=>{
        if(err){
            console.log(err)
            res.redirect('/register')
        }else{
           passport.authenticate('local')(req,res,()=>{
               res.render('secrets')
           })
        }
    })
})
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