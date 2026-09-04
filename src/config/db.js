const mongoose=require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']); 
function connectDB(){
  mongoose.connect(process.env.MONGODB_URI)
  .then(()=>{
    console.log("server is coonnected to db")
  })
  .catch(err => {
    console.error("Error connecting to db:", err);
    process.exit(1);
});

}

module.exports=connectDB;