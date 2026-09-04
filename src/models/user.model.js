const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:[true,'Email already exists'],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'Please fill a valid email address']
    },
    name:{
        type:String,
        required:[true,'Name is required'],
        
    },
    password:{  
        type:String,
        required:[true,'Password is required'],
        minlength:[4,'Password must be at least 4 characters long'],
        select:false
    }
},{timestamps:true});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return ;
    }
    this.password=await bcrypt.hash(this.password,10);
    return;
});  
userSchema.methods.comparePassword=async function(candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}
const userModel=mongoose.model('User',userSchema);
module.exports=userModel;
