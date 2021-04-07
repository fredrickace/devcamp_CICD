const AWS = require('aws-sdk');

const ID = 'AKIAZUE3YAV5GVSSIPVO';
const SECRET = '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';

const BUCKET_NAME = 'fredrick';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});


// s3.listBuckets(function(err, data) {
//     if (err) {
//         console.log("Error", err);
//     } else {
//         console.log("Success", data.Buckets);
//     }
//
//     process.exit();
// });

// call S3 to retrieve upload file to specified bucket
const file = process.argv[2];

// Configure the file stream and obtain the upload parameters
const fs = require('fs');
const fileStream = fs.createReadStream(file);
fileStream.on('error', function(err) {
    console.log('File Error', err);
});

const path = require('path');

const bucketParams = {
    Bucket: BUCKET_NAME,
    Key:`restaurant/images/${path.basename(file)}`,
    Body: fileStream,
    ACL: 'public-read'
};

// // bucketParams.Body = fileStream;
// const path = require('path');
// bucketParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
s3.upload (bucketParams, function (err, data) {
    if (err) {
        console.log("Error", err);
    } if (data) {
        console.log("Upload Success", data.Location);
    }
});
