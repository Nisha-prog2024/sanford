const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
      console.log(event);
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      var time = timeList[1].trim();
      console.log(time);
      console.log(date);
  
      let link = await pdfUpdate(event['standard'],event['base64']);
      console.log(link);
      
      if(link['status'] ==  "true"){
        const params = {
          TableName: 'dav_sanford_syallabus', 
          Key: {
              'standard' : event['standard'] 
          },
          UpdateExpression : 'SET #pdfUlr = :pdf, #date = :date, #updateTime = :updateTime',
          ExpressionAttributeNames: {
              '#pdfUlr' : 'pdfUlr',
              '#date' : 'date',
              '#updateTime' : 'updateTime'
          },
          ExpressionAttributeValues: {
              ':pdf' : link['body'],
              ':date' : date,
              ':updateTime' : time
          },
      };
      console.log(params);
      await dynamodb.update(params).promise();
      return {
        statusCode : 200,
        body : "Syallabus Updated SuccessFully"
      };  
      }
  }
  catch(e){
    return e.message;
  }
  
};




async function pdfUpdate(name,base64){
  try{
        name = name + ".pdf";
        console.log(name);
        let encodedData = base64;
        let pdf = Buffer.from(encodedData, 'base64');
        var bucketParams = {
        Bucket:'web-dav-sanford',
        Key: `syallabus/standard_${name}`,
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