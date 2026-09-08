const accountModel=require('../models/account.model');


async function createAccount(req,res){
    const user=req.user;

    const account=await accountModel.create({user:user._id});

    res.status(201).json({message:'Account created successfully',account:{
        _id:account._id,
        user:account.user,
        status:account.status,
        currency:account.currency
    }})

}

module.exports={createAccount};