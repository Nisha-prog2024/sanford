const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
      console.log(event);
      
      if(event['range'] == "" || event['range'] == undefined || event['fee'] == "" || event['fee'] == undefined || event['academic_year'] == "" || event['academic_year'] == undefined){
          return {
            statusCode : 404,
            body : "Range/fee/academic_year is required"
          };
        }
      
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      var time = timeList[1].trim();
      console.log(time);
      console.log(date);
  
      
        const params = {
          TableName: 'dav_sanford_fee_details', 
          Key: {
              'range' : event['range']
          },
          UpdateExpression : 'SET #fee = :fee, #academic_year = :academic_year, #date = :date, #time = :time, #type = :type',
          ExpressionAttributeNames: {
              '#fee' : 'fee',
              '#academic_year' : 'academic_year',
              '#date' : 'date',
              '#time' : 'time',
              '#type' : 'type' 
          },
          ExpressionAttributeValues: {
              ':fee': event['fee'],
              ':academic_year' : event['academic_year'],
              ':date' : date,
              ':time' : time,
              ':type' : "class fee"
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      return {
        statusCode : 200,
        body : "Fee Updated SuccessFully"
      };  
      
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};
