const { generateToken } = require('../config/jwttoken')
const adminSchema = require('../models/adminmodel')

const admincontrol = async (req, res) => {
    const { fullName, primaryNumber, role, email } = req.body
    console.log(req.body);
    const findAdmin = await adminSchema.findOne({ primaryNumber })
    console.log(findAdmin);
    if (!findAdmin) {
        try {
            const AdminDetails = new adminSchema({
                fullName: fullName,
                primaryNumber: primaryNumber,
                role: role,
                email: email
            })
            await AdminDetails.save();
            const token = await generateToken(AdminDetails._id)
            console.log(token);
            res.status(200).json({ success: true, message: 'Admin Created successfully', AdminDetails, token })
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ success: false, message: 'Internal server Error' })
        }
    } else {
        res.status(401).json({ success: false, message: 'Admin already exist' })
    }
}

module.exports = admincontrol