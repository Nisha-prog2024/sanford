var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();

exports.handler = async (event) => {
    try {
        console.log(event);

        if (event['transactionId'] == undefined || event['transactionId'] == "") {
            return {
                statusCode: 404,
                body: "Transaction Id is required"
            };
        }

        let Dparams = {
            TableName: "sanford_accounting_review",
            Key: {
                "transactionId": event['transactionId'],
            }
        };
        console.log(Dparams);
        let data = await dynamodb.get(Dparams).promise();
        console.log(data);
  
        if (data['Item'] == undefined) {
            return {
                statusCode: 404,
                body: "Transaction Id not found for Review"
            };
        }
        
        let params = {
            TableName: "sanford_accounting",
            Key: {
                "transactionId": event['transactionId'],
            }
        };
        
        await dynamodb.delete(params).promise();
        await dynamodb.delete(Dparams).promise();
        return {
            statusCode: 200,
            body: "Transaction Deleted Sucessfully" 
        };


    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};
