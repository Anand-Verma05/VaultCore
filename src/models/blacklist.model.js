const mongoose=require("mongoose");

const tokenBlackListSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,'Token is required'],
        unique:true
    },
    blackListedAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }
},{
    timestamps:true
});


tokenBlackListSchema.index({createdAt:1},{expireAfterSeconds:60*60*24*3}); //expire after 3d    

const tokenBlackListModel=mongoose.model('TokenBlackList',tokenBlackListSchema);
module.exports=tokenBlackListModel;