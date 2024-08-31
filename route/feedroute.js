const route =require('express').Router()
const multer = require('multer')

const {
    createPost,
    getAllFeedDetails,
    addLikeFeedPost,
    hidepost,
    deletefeedPostById
}=require('../controllers/feedpostctrl')

const {jwtverify}=require('../middleware/jwtverify')

const upload = multer({ storage: multer.memoryStorage() })

route.post('/createpost',jwtverify,upload.single('postImg'),createPost)
route.put('/addLikeToTrainerPost/:postId',jwtverify,addLikeFeedPost)
route.post('/hidePost/:postId', hidepost)
route.delete('/deletePost/:postId',jwtverify,deletefeedPostById)

route.get('/getallfeeddetails',getAllFeedDetails)
module.exports=route