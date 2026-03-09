var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();
var bucket = "web-dav-sanford";

exports.handler = async (event) => {
    try {
        console.log(event);

        if (Array.isArray(event['image_name']) == false) {
            return {
                statusCode: 400,
                body: "Image_name should be in array"
            } 
        }

        const len = event['image_name'].length;
        console.log(len);
        const links = [];
        for (let i = 0; i < len; i++) {
            let file_name = decodeURI(event['image_name'][i]);
            console.log(file_name);
            var id = "id" + Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
            console.log(id);

            const url = s3.getSignedUrl('putObject', {
                Bucket: bucket,
                Key: "gallery/" + id + file_name,                 //event['file_name'], 
                Expires: 10 * 60, //expiry time in sec
                // ContentType:'image/*' 
            });
            console.log(id + event['image_name']);
            console.log(url);
            links[i] = url;

        }
        return {
            statusCode: 200,
            body: links,
        };
    }
    catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
}; 