const route = require('express').Router()

const {
    employerCreatePost

} = require('../controllers/employercreatepostctrl')

const { jwtverify } = require('../middleware/jwtverify')

const multer = require('multer')

const upload = multer({ storage: multer.memoryStorage() })


route.post('/employercreatepost', jwtverify, upload.single('postImg'), employerCreatePost)



module.exports=route;

