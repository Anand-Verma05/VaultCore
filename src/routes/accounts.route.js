const express= require('express');


const router=express.Router();
const authMiddleware=require('../middleware/auth.middleware');
const authController=require('../controllers/account.controller');
const accountController=require('../controllers/account.controller');


router.post("/",authMiddleware.authMiddlerware,accountController.createAccount);


//get account details

router.get("/",authMiddleware.authMiddlerware,accountController.getUserAccountController);


//et accoutn balance

router.get("/balance/:accountId",authMiddleware.authMiddlerware,accountController.getAccountBalanceController);

module.exports=router;