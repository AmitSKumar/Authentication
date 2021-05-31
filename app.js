require('dotenv').config();
const express= require("express");
const  ejs   =require('ejs')
const mongoose =require('mongoose')
const encryption =require('mongoose-encryption');

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
//const secret = 'thisismysecret.';

//userSchema.plugin(encryption,{secret:secret,encryptedFields:["password"]})
userSchema.plugin(encryption,{secret:process.env.SECRET,encryptedFields:["password"]})
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
    const user = new User({email:req.body.username,password:req.body.password});
user.save((err)=>{
    if(!err){
        res.render("secrets");
    }else{
        console.log(err);
    }
});
})
app.post("/login",(req,res)=>{
User.findOne({email:req.body.username},(err,foundItem)=>{
if(foundItem){
    if(foundItem.password===req.body.password){
        res.render("secrets");
    }
}
})
})
app.listen(3000,()=>{
    console.log("server started on 3000")
})