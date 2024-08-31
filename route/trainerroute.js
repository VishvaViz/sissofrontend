const route = require('express').Router()
const {
    trainerSignUp, gettrainerProfile,trainerBasicInfoUpdate,trainerSkillsUpdate,updateSkillRangeById,trainerCertificateUpdate,trainerContactInfoUpdate,trainerExperienceInfoUpdate,
    trainerProfileImageUpdate,trainerProfileBannerUpdate,
    addBookMarkedPost,getBookMarkedPostsByUserId,trainerCertificateDelete,getTrainerDetailsById,getSkills,
    trainerAppliedTraining,getAppliedTraining,deleteAppliedTraining,addTrainingResources,
    testProfileApi,
    getAllTrainerDetails,
    UpdatePhoneNumber,
    trainerSearchHistory,
    getFeedBack,getNotifications,updateReadNotification,
    deleteAllNotification
} = require('../controllers/trainerctrl')

const {updateRequestStatus,getAllRequestTrainer}=require('../controllers/employerTrainingRequestctrl')

const {getEmployerProfileById}=require('../controllers/employerctrl')

const { jwtverify } = require('../middleware/jwtverify')
const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })  //for image uploading to s3 bucket

// route for trainers api

route.post('/trainerSignup', trainerSignUp) // add the trainer details add 1st time
route.put('/trainerBasicInfoUpdate', jwtverify,upload.fields([{ name: 'profileImg', maxCount: 1 },{ name: 'profileBanner', maxCount: 1 }]), trainerBasicInfoUpdate)
route.put('/trainerProfileImgUpdate',jwtverify,upload.single("profileImg"),trainerProfileImageUpdate) // update profile image of a user
route.put('/trainerProfileBannerUpdate',jwtverify,upload.single("profileBanner"),trainerProfileBannerUpdate) // update banner of profile
route.put('/trainerSkillsUpdate',jwtverify,trainerSkillsUpdate)
route.put('/updateAllSkills/:skillId', jwtverify,updateSkillRangeById)
route.put('/trainerCertificateUpdate',jwtverify, upload.fields([{name:'certificateImg',maxCount:Infinity}]),trainerCertificateUpdate)
route.put('/trainerContactInfoUpdate',jwtverify,trainerContactInfoUpdate)
route.put('/trainerExperienceInfoUpdate',jwtverify,trainerExperienceInfoUpdate)
route.get('/gettrainerProfile', jwtverify, gettrainerProfile) // to view the profile of the user who is logged in
route.get('/getTrainerDetailsById/:id', getTrainerDetailsById)   // get the trainer details by id
route.delete('/trainerCertificateDelete/:id',jwtverify,trainerCertificateDelete) // to delete the ceriticate 
route.get('/skills', getSkills)
route.put('/phoneNumberUpdate', jwtverify, UpdatePhoneNumber)

// route.post('/addBookMarkePost/:postId', jwtverify, addBookMarkedPost)   // to bookmark a post by trainer
route.post('/trainerAppliedTraining/:trainingPostId', jwtverify, trainerAppliedTraining)
route.delete('/deleteAppliedTraining/:trainingPostId', jwtverify, deleteAppliedTraining)
route.put('/addTrainingResources/:trainingDetailsId',upload.fields([{name:'fileData',maxCount:Infinity}]),jwtverify,addTrainingResources)
// route.get('/getBookMarkedPostsByUserId', jwtverify, getBookMarkedPostsByUserId)
route.get('/getAppliedTraining', jwtverify, getAppliedTraining)
route.post('/testProfileApi', upload.single('file'), testProfileApi)
route.get('/getAllTrainerDetails',getAllTrainerDetails)


route.get('/getAllRequestTrainer',jwtverify,getAllRequestTrainer);
route.put('/updateRequestStatus',jwtverify,updateRequestStatus)

route.get("/getEmployerProfileById/:id", getEmployerProfileById);
route.get('/searchData',trainerSearchHistory)
 
route.get('/feedback/:trainerId',getFeedBack)
route.get('/notifications/:userId',getNotifications)
route.put('/updateReadNotification/:notificationId',updateReadNotification)
route.put('/deleteAllNotification',deleteAllNotification)


module.exports = route