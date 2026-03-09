var AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    try {
      console.log(event);
        var params = {
            TableName: 'sanford_accounting',
            FilterExpression: "(begins_with(#transactionId,:val) or begins_with(#description,:val1) or begins_with(#amount,:val2))",
            ExpressionAttributeNames: {
                '#transactionId': 'transactionId',
                '#description': 'description',
                '#amount':'amount',
            },
            ExpressionAttributeValues: {
                ':val':  event['key'],
                ':val1': event['key'],
                ':val2': event['key'],
            }
        };
        console.log(params);
        var data = await dynamodb.scan(params).promise();
        console.log(data);
        
        let getParams = {
      TableName : 'sanford_accounting',
      Key : {
        'transactionId' : "startingBalance"
      } 
    };
    
    let startingBalance = await dynamodb.get(getParams).promise();
    console.log("Starting Balance : ",startingBalance);
        
    return {
            statusCode: 200,
            body: data,
            startingBalance : {
          bank : startingBalance['Item']['bank'],
          cash : startingBalance['Item']['cash']
        }
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};