const mongoose=require('mongoose');


const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true 
    }
    ,
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSED"],
            message:'Status must be either ACTIVE, FROZEN or CLOSED'
        },
        default:"ACTIVE"
    },
    currency:{
    type:String,
    required:[true,'Currency is required'],
    default:"INR"
    }
}, {
    timestamps: true
})


accountSchema.index({user:1,status:1}) //compound index to ensure a user can have only one active account at a time




const accountModel=mongoose.model('Account',accountSchema);
module.exports=accountModel;