const route = require('express').Router()
const {
    studentSignUp, studentBasicInfoUpdate,studentProfileImageUpdate,studentProfileBannerUpdate,studentSkillsUpdate,updateSkillRangeById,addStudentEducation, editEducation, deleteEducation, updateContactInfo, getstudentProfile, postJob
} = require('../controllers/studentctrl')

const {updateRequestStatus,getAllRequestTrainer}=require('../controllers/employerTrainingRequestctrl')

const {getEmployerProfileById}=require('../controllers/employerctrl')

const { jwtverify } = require('../middleware/jwtverify')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })  //for image uploading to s3 bucket

route.post('/studentSignup', studentSignUp) // add the trainer details add 1st time
route.get('/getstudentProfile', jwtverify, getstudentProfile) // to view the profile of the user who is logged in
route.put('/studentSignupBasicInfoUpdate', jwtverify,upload.fields([{ name: 'profileImg', maxCount: 1 },{ name: 'profileBanner', maxCount: 1 }]), studentBasicInfoUpdate)
route.put('/studentProfileImgUpdate',jwtverify,upload.single("profileImg"),studentProfileImageUpdate) // update profile image of a user
route.put('/studentProfileBannerUpdate',jwtverify,upload.single("profileBanner"),studentProfileBannerUpdate) // update banner of profile
route.put('/studentSkillsUpdate',jwtverify,studentSkillsUpdate)
route.put('/updateAllSkills/:skillId', jwtverify,updateSkillRangeById)
route.put('/addStudentEducation/:id',jwtverify,addStudentEducation)
route.put('/edit-education/:studentId/:educationIndex', jwtverify, editEducation)
route.delete('/delete-education/:studentId/:educationIndex', jwtverify, deleteEducation)
route.put('/update-contact-info/:studentId', jwtverify, updateContactInfo)
route.post('/postJob' ,upload.fields([{ name: 'resume', maxCount: 1 }]), postJob)

module.exports=route
