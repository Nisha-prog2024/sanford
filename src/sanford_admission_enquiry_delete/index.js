const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        console.log( "event : ",event);
        
        if(event['enqid'] == "" || event['enqid'] == undefined){
          return { 
            statusCode : 404, 
            body : "Id is required" 
          };
        }

        const params = {
          TableName: "dav_sanford_admission_enquiry",
          Key: {
            enqid: event['enqid']
          }
        };

        let data = await dynamoDB.get(params).promise();
        console.log(data);
        
        if(data['Item'] != undefined){
          await dynamoDB.delete(params).promise();
          return {
            statusCode: 200,
            body: 'Deleted successfully'
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