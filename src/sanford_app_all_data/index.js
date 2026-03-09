const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  
  try{
    let params = {
      TableName : "dav_sanford",
      Key : {
        id : "id97664635"
      }
    };
    console.log(params);
    let data = await dynamodb.get(params).promise();
    console.log(data);
    if(data['Item'] != undefined){
      return {
        statusCode : 200,
        body : data
      };
    }
    else{
      return{
        statusCode : 404,
        body : "App Link not Available"
      };
    }
    
    
  }catch(e){
    return { 
      statusCode : 500,
      body : e.message 
    }
  }
  
};
