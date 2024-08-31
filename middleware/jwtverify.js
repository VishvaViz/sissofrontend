const jwt = require('jsonwebtoken')
// const User = require('../models/usermodel')
const employerSchema=require('../models/employermodel')
const trainerSchema=require('../models/trainermodel')


const jwtverify = async (req, resp, next) => {
    const { authorization } = req.headers 
    // console.log('heades',req.headers)
    const token = authorization?.split(" ")[1]
    // console.log(token)
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_TOKEN)
            // const user = await User.findById(decoded._id)
            const employer = await employerSchema.findById({_id:decoded._id})
            const trainer = await trainerSchema.findById({_id:decoded._id})
            
            if(employer){
                // console.log('employer',employer)
                req.user = employer;
                next()
            }
            if(trainer){
                // console.log('trainer',trainer)
                req.user = trainer;
                next()
            }            
        }
        catch {
            return resp.status(200).send({ success: false, message: "Unauth" });
        }
    }
    else {
        console.log("not token in header")
        return  resp.status(200).send({success :false ,message:"No Token Provided"});
    }

}


const isadmin=async(req,resp,next)=>{
    const {Email}=req.user
    const admin=await User.findOne({Email})
    if(admin.Role=="admin"){
        next();
    }
    else{
        return resp.status(403).send({success:false,message:"You are not an Admin!"});
    }
}
module.exports = {jwtverify,isadmin}