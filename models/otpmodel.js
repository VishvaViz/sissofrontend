const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const otpSchema= new mongoose.Schema({
    contactInfo:{
        type:String,
        require:true
    },
    Otp:{
        type:String,
        require:true
    },
    createdAt: { 
        type: Date,
        default: Date.now,
        index: { expires: 60 }
    },
},
    {
        timestamps: true  // Saves createdAt and updatedAt as dates. Creates them in UTC.
    } 

)
otpSchema.pre("save",async function  (next){
    if (this.isModified("Otp")) {
        const salt =  bcrypt.genSaltSync(10);
        this.Otp = await bcrypt.hash(this.Otp, salt);
    }
    next();
})

module.exports=mongoose.model("otp",otpSchema)