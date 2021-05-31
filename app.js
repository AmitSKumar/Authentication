require('dotenv').config();
const express= require("express");
const  ejs   =require('ejs')
const mongoose =require('mongoose')
const bcrypt = require ("bcrypt");
const saltRounds=10;

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("Public"));
app.use(express.urlencoded({extended:true}))
mongoose.connect('mongodb://127.0.0.1:27017/userDb',{useNewUrlParser:true},
{ useUnifiedTopology: true } );

const userSchema=new mongoose.Schema({
    email:String,
    password:String
})
const User = mongoose.model('User',userSchema);

app.get('/',(req,res)=>{
    res.render("home")
})
app.get('/login',(req,res)=>{
    res.render("login")
})
app.get('/register',(req,res)=>{
    res.render("register")
})

app.post('/register',(req,res)=>{
    bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
        const user = new User({email:req.body.username,password:hash});
        user.save((err)=>{
            if(!err){
                res.render("secrets");
            }else{
                console.log(err);
            }
        });
    })
})
app.post("/login",(req,res)=>{
const password=req.body.password;
User.findOne({email:req.body.username},(err,foundItem)=>{
if(foundItem){
    bcrypt.compare(password,foundItem.password,(err,result)=>{
        if(result===true){
            res.render("secrets");
        }
    })
    
}
})
})
app.listen(3000,()=>{
    console.log("server started on 3000")
})