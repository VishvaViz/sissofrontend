// const mongoose = require('mongoose'); // Erase if already required
// const bcrypt=require('bcrypt')
// const jwt=require('jsonwebtoken')

// // Declare the Schema of the Mongo model
// const userSchema = new mongoose.Schema({
//     fullName:{
//         type:String,
//     },
//     firstName:{
//         type: String
//     },
//     lastName:{
//         type:String
//     },
//     designation:{
//         type:String
//     },
//     company:{
//         type:String,
//     },
//     role:{
//         type:String,
//     },
//     location:{
//         type:String
//     },
//     about:{
//         type:String
//     },
//     objective:{
//         type:String

//     },
//     profileImg:{
//         type:Buffer,
//     },
//     profileBanner:{
//         type: Buffer
//     },
//     skills:{
//         type: [
//             Object
//         ]
//     },
//     primaryNumber:{
//         type: Number,
//         unique:true,
//     },
//     secondaryNumber:{
//         type: Number,
//         unique:true,
//         sparse: true, // Allows multiple documents that have the same value for the indexed field if one of the values is null.
//     },
//     address:{
//         type:String
//     },
//     email:{
//         type: String,
//         unique:true,
//         lowercase: true,
//         sparse:true, // Allows multiple documents that have the same value for the indexed field if one of the values is null.
//     },
//     website:{
//         type:String
//     },
//     certificateHead:{
//         type:String
//     },
//     certificateDescription:{
//         type:String
//     },
//     certificate:{
//         type:[Buffer]  // Array of Certificates
//     },
//     experience:[
//         {
//             companyName :{
//                 type:String
//             },
//             designation :{
//                 type:String
//             },
//             startDate :{
//                 type: Date ,
//                 required: true
//             },
//             endDate :{
//                 type: Date 
//             } ,
//             currentlyWorking : {
//                 type: Boolean , default: false
//             },
//             roleDescription:{
//                 type:String
//             }  
//         }
//     ]
    
// },
// {
//     timestamps:true
// },
// );


// //encrpting password before saving in the db

// // userSchema.pre("save", async function (){
// //     if(this.isModified("password")){
// //         const salt = await bcrypt.genSaltSync(10);
// //         this.password=await bcrypt.hash(this.password,salt)
// //     }
// // })

// // const key=process.env.JWT_TOKEN
// // userSchema.methods.generateToken =async function  (){
// //   try{
// //       if(!key){
// //           throw Error("Code not found")
// //       }
// //       const token=jwt.sign({_id:this._id},key,{expiresIn:'1d'})
// //       this.tokens=this.tokens.concat({token:token})
// //       await this.save()
// //       return token
// //   }
// //   catch(error){
// //       console.log(error)
// //       throw error
// //   }
// // }

// module.exports = mongoose.model('User', userSchema);
 