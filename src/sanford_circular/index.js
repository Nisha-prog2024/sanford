const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
      console.log(event);
      
      if(event['base64'] == "" || event['base64'] == undefined ){
        return {
          statusCode : 404,
          body : "Pdf is required"
        };
      }
      
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      time = timeList[1].trim();
      console.log(time);
      console.log(date);
      
      let link = await pdfupdate(event['base64']);
      console.log(link);
      var id = "id"+ Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
      
      if(link['status'] == "true"){
        const params = {
          TableName: 'dav_sanford', 
          Key : {
            'id' : "id98567542"
          },
          UpdateExpression : 'SET #pdfUrl = :pdfUrl, #date = :date, #updateTime = :time, #pk = :pk, #tstamp = :tstamp',
          ExpressionAttributeNames: {
              '#pdfUrl' : 'pdfUrl',
              '#date' : 'date',
              '#updateTime' : 'updateTime',
              '#tstamp' : 'tstamp',
              '#pk' : 'pk'
          },
          ExpressionAttributeValues: {
              ':pdfUrl' : link['body'],
              ':pk': "1",
              ':time' : time,
              ':date' : date,
              ':tstamp' : Number(Date.now()),
          },
        };
        console.log(params);
        await dynamodb.update(params).promise();
      
        return {
          statusCode : 200,
          body : "Circular Uploaded SuccessFully"
        };
      }
      else{
        return {
          statusCode : 500,
          body : link
        };
      }
  }
  catch(e){
    return {
      statusCode : 500,
      body : e.message
    };
  }
  
};

async function pdfupdate(base64){
  try{
        let encodedData = base64;
        let pdf = Buffer.from(encodedData, 'base64');
        var bucketParams = {
        Bucket:'web-dav-sanford',
        Key: `circular.pdf`,
        Body:pdf,
        ContentType: 'application/pdf'
    };
    console.log(pdf);
    const link=await s3.upload(bucketParams).promise();
    return{
          status : "true",
          body :  link['Location']
        };
    
  }catch(e){
    return e.message;
  }
}