const express= require('express');


const router=express.Router();
const authMiddleware=require('../middleware/auth.middleware');
const authController=require('../controllers/account.controller');
const accountController=require('../controllers/account.controller');


router.post("/",authMiddleware.authMiddlerware,accountController.createAccount);




module.exports=router;