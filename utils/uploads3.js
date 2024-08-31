const aws = require('aws-sdk')
aws.config.update({
    accessKeyId: process.env.S3_ACCESSKEY_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,

})
const s3 = new aws.S3();

const generateS3UploadParams = (bucketName, file) => {
    return {
        Bucket: bucketName,
        Key: `${file.originalname}`, // Customize the key as needed
        Body: file.buffer,
        ContentType: file.mimetype
    };
};

module.exports=generateS3UploadParams

















































// const s3 = new S3Client({
//     region: process.env.S3_BUCKET_REGION,
//     credentials: {
//         accessKeyId: process.env.S3_ACCESSKEY_KEY,
//         secretAccessKey: process.env.S3_SECRET_KEY
//     },
//     sslEnabled: false,
//     s3ForcePathStyle: true,
//     signatureVersion: 'v4',

// })

// const upload = (bucketName) => multer({
//     storage: multers3({
//         s3,
//         bucket: bucketName,
//         contentType:multers3.AUTO_CONTENT_TYPE,
//         metadata: function (req, file, cb) {
//             console.log(file);
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             console.log(file);
//             cb(null, `${file.originalname}}`);
//         }
//     })
// });

    // const single = upload("sisso-data").single('file');

    // single(req, resp, async (error) => {
    //     if (error) {
    //         console.log(error)
    //         resp.json({ success: false, message: ' Error while uploading image', error });
    //     }
    //     data = req.file;
    // })
    // console.log(data)