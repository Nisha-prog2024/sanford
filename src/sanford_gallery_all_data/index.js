const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const s3 = new AWS.S3();
    const bucketName = 'web-dav-sanford';
    const folderName = 'gallery/';

    const listParams = {
        Bucket: bucketName,
        Prefix: folderName
    };

    try {
        const objects = await s3.listObjectsV2(listParams).promise();
        
        const imageObjects = objects.Contents.filter(obj => obj.Key.endsWith('.jpg') || obj.Key.endsWith('.png'));
        
        imageObjects.sort((a, b) => a.LastModified - b.LastModified);
        
        const imageURLs = imageObjects.map(obj => `https://${bucketName}.s3.amazonaws.com/${obj.Key}`);
        
        const response = {
            statusCode: 200,
            body: imageURLs
        };
        return response;
    } catch (error) {
        const response = {
            statusCode: 500,
            body: error.message
        };
        return response;
    }
};