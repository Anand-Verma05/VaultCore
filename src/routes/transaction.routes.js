const {Router}=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const transactionRouter=Router();
const transactionController=require('../controllers/transaction.controller');


//create new transaction
transactionRouter.post("/",authMiddleware.authMiddlerware,transactionController.createTransaction);



module.exports=transactionRouter;