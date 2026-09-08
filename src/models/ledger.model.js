const mongoose=require('mongoose');

const LedgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:[true,'Account is required'],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,'Amount is required'],
        // min:[0,'Amount must be greater than 0'],
        immutable:true
    }
    ,
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Transaction',
        required:[true,'Transaction is required'],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:'Type must be either CREDIT or DEBIT'
    },
    required:[true,'Type is required'],
    immutable:true
    }
},{
    timestamps:true

});

function preventLedgerModification(){
    throw new Error('Ledger entries cannot be modified or deleted');
}

ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('findOneAndRemove',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification); 

const LedgerModel=mongoose.model('Ledger',LedgerSchema);
module.exports=LedgerModel;