const express = require('express');
const authRouter=require('./routes/auth.route');
const cookieParser=require('cookie-parser');
const accountRouter=require('./routes/accounts.route');


// const app=express();
const app=express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
module.exports=app;