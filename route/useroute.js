const route=require('express').Router()
const {generateopt,verifyOtp, getuser,getuserId,getAlluser,updateProfile}=require('../controllers/userctrl')
const {jwtverify,isadmin}=require('../middleware/jwtverify')

//User routes 
route.post("/generateotp",generateopt)
route.post("/verifyotp",verifyOtp)
route.get("/getuser",jwtverify,getuser)
route.put("/updateProfile/:userId",jwtverify,updateProfile)
route.get("/getAllUser",jwtverify,isadmin,getAlluser)
route.get("/:userId",getuserId)





module.exports=route

