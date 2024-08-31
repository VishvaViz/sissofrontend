const aws = require('aws-sdk')
require('dotenv').config()

const employerCreatePostSchema = require('../models/employercreatepostmodel')



const employerCreatePost = async (req, resp) => {
    const { _id } = req.user

    console.log('req.body',req.body)

    try {
        let postImgUrl;
        let postedImg = {
            fileName: '',
            postImg: ''

        }
        if (req.file === undefined) {
            postedImg.fileName = 'noImage'
        }
        if (req.file) {
            const postImg = req.file
            const params = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: `employer/employerPost/${_id}/${postImg.originalname}`,
                Body: postImg.buffer,
                ContentType: postImg.mimetype
            };
            const data = await s3.upload(params).promise();
            // console.log("Image uploaded successfully at ", data.Location);
            postImgUrl = data.Location;
            postedImg.fileName = postImg.originalname
            postedImg.postImg = postImgUrl

        }

        // else {
        //     return resp.status(200).json({ success: false, message: 'Error in the Upload Image' })
        // }

        if (req.body) {

            const employerCreatePostDetails = new employerCreatePostSchema({
                postedById: _id,
                postForAllSissoMember: req.body.postForAllSissoMember || false,
                onlyPostMyConnenctions: req.body.onlyPostMyConnenctions || false,
                postedDescrition: req.body.postDescription,
                postedImg: postedImg
            })
            console.log(employerCreatePostDetails)
            if (employerCreatePostDetails) {
                await employerCreatePostDetails.save()
                return resp.status(201).json({ success: true, message: "Your Post has been created Successfully!", employerCreatePostDetails });
            }
        }
        else {
            return resp.status(200).json({ success: false, message: "No Data Provided" })
        }
    }
    catch (error) {
        console.log('error', error)
        return resp.status(500).json({ success: false, message: "Internal Server Error", error });
    }

}





module.exports={
    employerCreatePost
}