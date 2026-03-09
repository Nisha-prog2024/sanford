const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  try{
    
      console.log(event);
      
      let getparams = {
        TableName : "sanford_accounting",
        Key : {
          "transactionId" : event['transactionId']
        }
      };
    
      let data = await dynamodb.get(getparams).promise();
      console.log("Temp Data : ",data);
      
      if(data['Item'] == undefined){
        return {
          statusCode : 404,
          body : "Invalid Transaction Id"
        };
      }
      
      let reviewparams = {
        TableName : "sanford_accounting_review",
        Key : {
          "transactionId" : event['transactionId']
        }
      };
    
      let data1 = await dynamodb.get(getparams).promise();
      console.log("Temp Data : ",data1);
      
      if(data1['Item'] == undefined){
        return {
          statusCode : 404,
          body : "Transaction Id Is Not Under Review"
        };
      }
      
      
      const params = {
          TableName: 'sanford_accounting', 
          Key: {
              'transactionId' : event['transactionId']
          },
          UpdateExpression : 'SET #review = :val1',
          ExpressionAttributeNames: {
              '#review' : 'review'
          },
          ExpressionAttributeValues: {
            ':val1' : "false"
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      
      
      await dynamodb.delete(reviewparams).promise();
      
      return {
        statusCode : 200,
        body : "Transaction Deleted SuccessFully"
      }; 
      
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};