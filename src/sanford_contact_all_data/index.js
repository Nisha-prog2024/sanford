const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  
  try{
    let params = {
      TableName : "dav_sanford",
      Key : {
        id : "id78573126"
      }
    }
    console.log(params);
    let data = await dynamodb.get(params).promise();
    console.log(data);
    return {
      statusCode : 200,
      body : data
    }
    
  }catch(e){
    return { 
      statusCode : 500,
      body : e.message 
    }
  }
  
};
