const express = require('express');
const authRoutes=require('./routes/auth.route');
const cookieParser=require('cookie-parser');
const accountRoutes=require('./routes/accounts.route');
const transactionRoutes=require('./routes/transaction.routes');


// const app=express();
const app=express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/accounts",accountRoutes);
app.use("/api/transactions",transactionRoutes);
module.exports=app;