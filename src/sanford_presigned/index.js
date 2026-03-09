var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();
var bucket = "web-dav-sanford";
exports.handler = async (event) => {
  try {
    console.log(event);
        
        if (event['file_name'] == undefined || event['file_name'] == "") {
            return {
                statusCode: 400,
                body: "file_name not found"
            }
        }

    if (Array.isArray(event['file_name']) == false) {
      return {
        statusCode: 400,
        body: "file_name should be in array"
      }
    }

    const len = event['file_name'].length;
    console.log(len);
    const links = [];
    for (let i = 0; i < len; i++) {
      let file_name = decodeURI(event['file_name'][i]);
      console.log(file_name);
      var id = "id" + Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
      console.log(id);

      const url = s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: "poster_image" + "/" + id + file_name,                 //event['file_name'], 
        Expires: 10 * 60, //expiry time in sec
        // ContentType:'image/*' 
      });
      console.log(id + event['file_name']);
      console.log(url);
      links[i] = url;

    }
    return {
      statusCode: 200,
      //   body:decodeURI(url)
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