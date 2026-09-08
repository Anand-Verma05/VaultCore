const transactionModel = require('../models/transaction.model');

const ledgerModel = require('../models/ledger.model');
const emailService = require('../services/email.service');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');
/** 

* * - Create a new transaction
* THE 10-STEP TRANSFER FLOW:
Validate request
* 2. Validate idempotency key
* 3. Check account status
* 4. Derive sender balance from ledger
* 5. Create transaction (PENDING)
* 6. Create DEBIT ledger entry
* 7. Create CREDIT ledger entry
* 8. Mark transaction COMPLETED
* 9. Commit MongoDB session
* 10. Send email notification

*/


async function createTransaction(req,res){

    // step 1: Validate request
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:'Missing required fields'});
    }

    const toUserAccount=await accountModel.findById(toAccount); 
    const fromUserAccount=await accountModel.findById(fromAccount);

    if(!toUserAccount || !fromUserAccount){
        return res.status(400).json({message:'Invalid account'});
    }

    // step 2: Validate idempotency key
    const existingTransaction=await transactionModel.findOne({idempotencyKey});

    if(existingTransaction){
        if(existingTransaction.status==='COMPLETED'){
            return res.status(200).json({message:'Transaction already completed',transaction:existingTransaction});
        }
        else if(existingTransaction.status==='PENDING'){
            return res.status(200).json({message:'Transaction already pending'});
        }
        else if(existingTransaction.status==='FAILED'){
            return res.status(500).json({message:'Transaction already failed',});
        }
        else if(existingTransaction.status==='REVERSED'){
            return res.status(200).json({message:'Transaction already reversed'});
        }
    }

    // step 3: Check account status

     if(fromUserAccount.status!=='ACTIVE' || toUserAccount.status!=='ACTIVE'){
        return res.status(400).json({message:'One or both accounts are not active'});
    }

    //step 4: Derive sender balance from ledger
     const balance=await fromUserAccount.getBalance();

     if(balance<amount){
        return res.status(400).json({message:`Insufficient balance , current balance is ${balance},required balance is ${amount}`});
     }

     //step 5 : Create transaction (PENDING)
     const session=await transactionModel.startSession();

     session.startTransaction();

     const transaction=await transactionModel({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:'PENDING'
     },{session});
     
    

     const debitLedgerEntry=await ledgerModel.create({
        account:fromAccount,
        amount:amount,
        type:'DEBIT',
        transaction:transaction._id
     },{session});

     const creditLedgerEntry=await ledgerModel.create({
        account:toAccount,
        amount:amount,
        type:'CREDIT',
        transaction:transaction._id
     },{session});

     transaction.status='COMPLETED';

     await transaction.save({session});

        await session.commitTransaction();
        await session.endSession();

    // send email notification to both users

    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount);

    return res.status(200).json({message:'Transaction completed successfully',transaction});




   






}


async function createInitialFundsTransaction(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:'Missing required fields'});
    }

    const toUserAccount=await accountModel.findById(toAccount);

    if(!toUserAccount){
        return res.status(400).json({message:'Invalid account'});
    }

    if(toUserAccount.status!=='ACTIVE'){
        return res.status(400).json({message:'Account is not active'});
    }

    const fromUserAccount=await accountModel.findOne({user:req.user._id});

    if(!fromUserAccount){
        return res.status(400).json({message:'System user account not found'});
    }

    const session=await mongoose.startSession();
    session.startTransaction();

const [transaction] = await transactionModel.create([{
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: 'PENDING'
}], { session });
    

     const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccount._id,
        amount:amount,
        type:'DEBIT',
        transaction:transaction._id
     }],{session});

     const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        type:'CREDIT',
        transaction:transaction._id
     }],{session});

     transaction.status='COMPLETED';

     await transaction.save({session});

        await session.commitTransaction();
        await session.endSession();

        return res.status(200).json({message:'Initial funds transaction completed successfully',transaction});  



}

module.exports={createTransaction,createInitialFundsTransaction};