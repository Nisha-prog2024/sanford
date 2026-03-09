const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    
    console.log("Event Body : ",event);
    if(event['standard'] == "" || event['standard'] == undefined || event['academic_year'] == "" || event['academic_year'] == undefined){
      return {
        statusCode : 400,
        body : "Standard and Academic year are required"
      };
    }
    
    // const params = {
    //   TableName: 'erp_students_fee',
    //   FilterExpression: "(#standard = :standard AND #academic_year = :academic_year)",
    //   ExpressionAttributeNames: {
    //     '#standard': 'standard',
    //     '#academic_year' : 'academic_year'
    //   },
    //   ExpressionAttributeValues: {
    //     ':standard': event['standard'],
    //     ':academic_year' : event['academic_year']
    //   }
    // };
    
    const params = {
      TableName : 'erp_students_fee',
      Key: {
        'id' : event['standard'] + "_" + event['academic_year'] 
      }
    };
    console.log("Params : ",params);
    const result = await dynamoDB.get(params).promise();
    console.log(result);
    
    return{
      statusCode : 200,
      body : result
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
};
