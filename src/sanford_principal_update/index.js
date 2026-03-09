const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
    
    if(event['message'] == "" || event['message'] == undefined || event['base64'] == "" || event['base64'] == undefined ){
      return {
        statusCode : 200,
        body : "Message/Image is required"
      };
    }
      console.log(event);
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      var time = timeList[1].trim();
      console.log(time);
      console.log(date);
  
      let link = await imageupdate(event['base64']);
      console.log(link);
      
      if(link['status'] ==  "true"){
        const params = {
          TableName: 'dav_sanford', 
          Key: {
              'id' : "id54326465"
          },
          UpdateExpression : 'SET #message = :message, #imageUrl = :image, #date = :date, #updateTime = :updateTime',
          ExpressionAttributeNames: {
              '#message' : 'message',
              '#imageUrl' : 'imageUrl',
              '#date' : 'date',
              '#updateTime' : 'updateTime'
          },
          ExpressionAttributeValues: {
              ':message': event['message'],
              ':image' : link['body'],
              ':date' : date,
              ':updateTime' : time
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      return {
        statusCode : 200,
        body : "Updated SuccessFully"
      };  
      }else{
        return {
            statusCode : 500,
            body : link
          
        }
      }
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};

async function imageupdate(base64){
  try{
        let encodedData = base64;
        let image = Buffer.from(encodedData.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var bucketParams = { 
            Bucket: "web-dav-sanford",
            Key: `principal_image.jpg`,
            Body:image,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        console.log(bucketParams);
        const link= await s3.upload(bucketParams).promise();
        console.log(link);
        return{
          status : "true",
          body :  link['Location']
        };
  }
  catch(e){
    return e.message;
  }
}
