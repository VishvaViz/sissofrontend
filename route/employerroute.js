const route = require('express').Router()

//employer Details route 
const {
    employerSignUp, getemployerProfile,getEmployerProfileById, employerBasicInfoUpdate,employerProfileImageUpdate,employerProfileBannerUpdate, employerSkillsUpdate, employerContactInfoUpdate, employerExperienceInfoUpdate,getSkills,
    getAppliedTrainingEmployer,getAcceptedTrainingEmployer, employerExperienceInfoDelete,updateProfileVisibility, addBookMarkedPost, getBookMarkedPostsByUserId, UpdatePhoneNumber,
    getNotifications,updateReadNotification,
    deleteAllNotification,
    getOngoingTrainingEmployer,
    getCompletedTrainingEmployer,

} = require('../controllers/employerctrl')

// trainer training routes
const {
    getAllAppliedTraining, updateAppliedStatus,addFeedback,
} = require('../controllers/trainerappliedctrl')

const {
    employerTrainingRequest,
    getEmployerApplicationRequest
}=require('../controllers/employerTrainingRequestctrl')


const { getTrainerDetailsById } = require('../controllers/trainerctrl')


const { jwtverify } = require('../middleware/jwtverify')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })  //for image uploading to s3 bucket

// route for employer api

route.post('/employerSignup', employerSignUp) // add the employer details add 1st time
route.put('/employerBasicInfoUpdate', jwtverify,upload.fields([{ name: 'profileImg', maxCount: 1 },{ name: 'profileBanner', maxCount: 1 }]), employerBasicInfoUpdate)
route.put('/employerProfileImgUpdate',jwtverify,upload.single("profileImg"),employerProfileImageUpdate)
route.put('/employerProfileBannerUpdate',jwtverify,upload.single("profileBanner"),employerProfileBannerUpdate)
route.put('/employerSkillsUpdate', jwtverify, employerSkillsUpdate)
route.put('/employerContactInfoUpdate', jwtverify, employerContactInfoUpdate)
route.put('/employerExperienceInfoUpdate', jwtverify, employerExperienceInfoUpdate)
route.get('/getemployerProfile', jwtverify, getemployerProfile) // to view the profile of the user who is logged in
route.get('/getAppliedTrainingEmployer', jwtverify, getAppliedTrainingEmployer)
route.get('/getAcceptedTrainingEmployer',jwtverify,getAcceptedTrainingEmployer)

route.get('/getOngoingTrainingEmployer',jwtverify,getOngoingTrainingEmployer)
route.get('/getCompletedTrainingEmployer',jwtverify,getCompletedTrainingEmployer)


route.put('/updateProfileVisibility',jwtverify,updateProfileVisibility)
route.get('/getTrainerDetailsById/:id', getTrainerDetailsById)
route.delete('/employerExperienceInfoUpdate/:_id', jwtverify, employerExperienceInfoDelete)
route.get('/skills',getSkills)
route.put('/phoneNumberUpdate', jwtverify, UpdatePhoneNumber)



route.get('/notifications/:userId',getNotifications)
route.put('/updateReadNotification/:notificationId',updateReadNotification)
route.put('/deleteAllNotification',deleteAllNotification)

route.put('/updateAppliedStatus', jwtverify, updateAppliedStatus)   // update applied status of training from employer side


route.get('/getAllAppliedTraining', jwtverify, getAllAppliedTraining)

route.put('/addFeedback/:trainingDetailsId',jwtverify,addFeedback)

// route.post('/addBookMarkePost/:postId', jwtverify, addBookMarkedPost)   // to bookmark a post by employer
// route.get('/getBookMarkedPostsByUserId', jwtverify, getBookMarkedPostsByUserId)

route.post('/employerTrainingRequest',jwtverify,employerTrainingRequest)
route.get('/getEmployerApplicationRequest',jwtverify,getEmployerApplicationRequest)



module.exports = route