const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
      console.log(event);
      
      if(event['address']== "" || event['address'] == undefined || event['contact']=="" || event['contact'] == undefined || event['workTime'] == "" || event['workTime'] == undefined){
        return {
          statusCode : 404,
          body : "Address/contact/workTime is required"
        };
      }
      
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      time = timeList[1].trim();
      console.log(time);
      console.log(date);
  
        const params = {
          TableName: 'dav_sanford', 
          Key: {
              'id' : "id7857"
          },
          UpdateExpression : 'SET #address = :address, #contact = :contact, #workTime = :workTime, #date = :date, #updateTime = :updateTime',
          ExpressionAttributeNames: {
              '#address' : 'address',
              '#contact' : 'contact',
              '#workTime' : 'workTime',
              '#date' : 'date',
              '#updateTime' : 'updateTime'
          },
          ExpressionAttributeValues: {
              ':address' : event['address'],
              ':contact' : event['contact'],
              ':workTime' : event['workTime'],
              ':date' : date,
              ':updateTime' : time
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      
      return {
        statusCode : 200,
        body : "Contact Updated SuccessFully"
      };  
      
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};