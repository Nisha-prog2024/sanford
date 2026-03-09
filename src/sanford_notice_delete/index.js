const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3=new AWS.S3();

exports.handler = async (event) => {
    try {
        console.log(event);
        
        if(event['id'] == "" || event['id'] == undefined){
          return {
            statusCode : 404,
            body : "Id is required"
          };
        }

        const params = {
          TableName: "dav_sanford_notice",
          Key: {
            id: event['id']
          }
        };

        let data = await dynamoDB.get(params).promise();
        console.log(data);
        
        if(data['Item'] != undefined){
          console.log(data['Item']['pdfUrl']);
          let objectKey = decodeURI(data['Item']['pdfUrl'].split('/')[3] + "/" + data['Item']['pdfUrl'].split('/')[4]);
          console.log(objectKey);
    
          let fileName = decodeURI(objectKey);
          console.log("File Name : ",fileName);
    
          const dParams = {
            Bucket: 'web-dav-sanford',
            Key: objectKey,
          };

          let check = await s3.deleteObject(dParams).promise();
          console.log(check);
          await dynamoDB.delete(params).promise();
          
          return {
            statusCode: 200,
            body: 'Notice deleted successfully'
          };
        }
        else{
          return{
            statusCode: 404,
            body : "Invalid id"
          }
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message
        };
    }
};