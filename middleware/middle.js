const jwt = require("jsonwebtoken");
// const data = require("../modals/data");
const verifytoken = (req,res,next)=>{
    const token =  req.body.token  || req.query.token ||req.headers["xtoken"];
    if(!token){
        return res.status(401).send("token is required");

    }
    try{
        const decode = jwt.verify(token,'secret');
    

    }catch(err){
        res.status(400).send("unauthenticated");
    }
    return next();
};

module.exports = verifytoken;