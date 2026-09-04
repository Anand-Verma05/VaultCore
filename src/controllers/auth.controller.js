const userModel=require('../models/user.model');

const jwt=require('jsonwebtoken');

async function registerUser(req,res){
    const {email,name,password}=req.body;


    const isExist=await userModel.findOne({email});
    

    if(isExist){
        return res.status(400).json({message:'Email already exists'});
    }

    const user=await userModel.create({email,name,password});

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});


    res.cookie('token',token,{httpOnly:true,secure:true,maxAge:3600000});
  res.status(201).json({message:'User registered successfully',user:{
    _id:user._id,
    email:user.email,
    name:user.name
  }});

}

async function loginUser(req,res){
    const {email,password}=req.body;

    const user=await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({message:'Invalid email or password'});
    }

    const isMatch=await user.comparePassword(password);

    if(!isMatch){
        return res.status(400).json({message:'Invalid email or password'});
    }

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});

    res.cookie('token',token,{httpOnly:true,secure:true,maxAge:3600000});
    res.status(200).json({message:'User logged in successfully',user:{
        _id:user._id,
        email:user.email,
        name:user.name
      }});
}


module.exports={registerUser,loginUser};