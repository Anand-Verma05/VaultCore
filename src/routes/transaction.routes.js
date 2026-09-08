const {Router}=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const transactionRouter=Router();
const transactionController=require('../controllers/transaction.controller');


//create new transaction
transactionRouter.post("/",authMiddleware.authMiddlerware,transactionController.createTransaction);


//create initial funds transaction for system user

transactionRouter.post("/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);


module.exports=transactionRouter;