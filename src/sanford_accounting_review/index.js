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
            ':val1' : "true"
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      
      
      const putParams = {
        TableName : "sanford_accounting_review",
        Item : data['Item']
      };
       
      await dynamodb.put(putParams).promise();
      
      return {
        statusCode : 200,
        body : "Sent For Review SuccessFully"
      }; 
      
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};