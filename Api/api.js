const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
let jwtKey = "private";


const app = express();

app.use(express.json());
app.use(cors());
const UserData = require("../Schema/Users");

const verifyToken = (req , resp , next)=>{
    let token = req.headers['authorization']
    if(token){
        token = token.split(' ')[1]
        jwt.verify(token , jwtKey , (err,valid)=>{
            if(!err){
                next()
            }else{
                resp.status(404).send("Please provide a valid header")
            }
        })
    }else{
        resp.status(400).send("Please provide a valid header")
    }
}

app.get('/allUser' , async (req , resp)=>{
  let data = await UserData.find()
  if(data){
    resp.send(data)
    console.log("users fetched");
    
  }else{
    resp.status(400).send("error")
  }
})

app.post("/user/sign", async (req, resp) => {
  let data = new UserData(req.body);
  let result = await data.save();
  jwt.sign({ result }, jwtKey, { expiresIn: "1h" }, (err, token) => {
    if (!err) {
      if (result) {
        resp.send({ result, auth: token });
        console.log("User has been added");
      } else {
        resp.status(400).send("Error");
      }
    } else {
      resp.status(400).send("Invalid token");
    }
  });
});

app.post("/user/log", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let data = await UserData.findOne(req.body);
    jwt.sign({ data }, jwtKey, { expiresIn: "1h" }, (err, token) => {
      if (!err) {
        if (data) {
          resp.send({ data, auth: token });
          console.log("Logged In");
          
        } else {
          resp.status(400).send("User not found");
        }
      } else {
        resp.status(400).send("Invalid token");
      }
    });
  } else {
    resp.status(404).send("please provide both the input");
  }
});



app.put('/user/:id' , verifyToken , async (req , resp)=>{
    let data = await UserData.updateOne(
        {_id : req.params.id},
        {$set:req.body}
    )
    if(data){
        resp.send(data)
        console.log("Information has been modified");
        
    }else{
        resp.status(400).send("Some Error has been occurred")
    }
})

app.get("/user/:id" , async (req , resp)=>{
  let data = await UserData.findOne({_id:req.params.id})
  if(data){
    resp.send(data)
    console.log("Record fetched successfully");
    
  }else{
    resp.status(400).send("error")
  }
})

app.listen(5000)