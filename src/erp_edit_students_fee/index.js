const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
  // TODO implement
  try{
    console.log("Event Body  : ",event);
    if(event['standard'] == "" || event['standard'] == undefined || event['month'] == "" || event['month'] == undefined ){
            return{
                statusCode : 400,
                body : "standard/Month is Required"
            };
        }
        if(Array.isArray(event['fee_details']) == false){
           return{
                statusCode : 400, 
                body : "Fee Details should be in array"
            }; 
        }
        
        if(event['fee_details'][0].fee_type == undefined || event['fee_details'][0].fee_type == ""  || event['fee_details'][0].amount == undefined || event['fee_details'][0].amount == ""){
            return{
                statusCode: 400,
                body : "Fee Type and Amount is required in Fee Details" 
            };
        }
         
    let param = {
      TableName : "erp_students_fee",
      Key: {
              // 'standard' : event['standard']
              'id' : event['standard'] + '_' + event['academic_year']
          },
          UpdateExpression: "SET #month = :month",
          ExpressionAttributeNames: {
              "#month": event["month"].toLowerCase(),
          },
          ExpressionAttributeValues: {
              ":month": event['fee_details'],
          }
    };
    console.log("Params : ",param);
    await dynamoDB.update(param).promise();
    
    return{
      statusCode : 200,
      body: "Updated Successfully"
    };
    
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
};
