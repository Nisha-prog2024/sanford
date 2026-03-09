const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  try{
    console.log("Event Body : ",event);
    
    if(event['teacherErpAppUrl'] == "" || event['teacherErpAppUrl'] == undefined || event['studentErpAppUrl'] == "" || event['studentErpAppUrl'] == undefined){
      return {
        statusCode : 400,
        body : "TeacherErpAppUrl / StudentErpAppUrl is Required"
      } ;
    }
    
    
    let params = {
      TableName : 'dav_sanford',
      Key : {
        'id' : 'id97664635'
      },
      UpdateExpression: 'set #teacherErpAppUrl = :val , #studentErpAppUrl = :val1' ,
      ExpressionAttributeNames: { 
        '#teacherErpAppUrl': 'teacherErpAppUrl',
         '#studentErpAppUrl' : 'studentErpAppUrl'
      },
      ExpressionAttributeValues: { 
        ':val': event['teacherErpAppUrl'] ,
        ':val1': event['studentErpAppUrl']
      }
    };
    console.log(params);
    await dynamodb.update(params).promise();
    return {
      statusCode: 200,
      body: "Erp App Url updated successfully"
    };
    
    
  }catch(e){
    return {
      statusCode : 500,
      body : e.message
    }
  }
};
