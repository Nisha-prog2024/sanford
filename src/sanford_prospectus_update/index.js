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
      
      let getparam = {
        TableName : "dav_sanford",
        Key : {
          'id' : "id79765967"
        }
      }
      let data = await dynamodb.get(getparam).promise();
      console.log(data);
      
      if(data['Item'] != undefined){
        console.log(data['Item']['pdfUrl']);
        let file_name = data['Item']['pdfUrl'].split('/')[3] + "/" + data['Item']['pdfUrl'].split('/')[4];
        console.log(file_name);
        file_name = decodeURI(file_name);

        const params = {
            Bucket: "web-dav-sanford",
            Key: file_name                              // 'some/subfolders/nameofthefile1.extension'
        };
        let ch = await s3.deleteObject(params).promise();
        console.log(ch); 
      }
  
      let link = await pdfUpdate(event['pdf']['name'],event['pdf']['base64']);
      console.log(link);
      
      if(link['status'] ==  "true"){
        const params = {
          TableName: 'dav_sanford', 
          Key: {
              'id' : "id79765967"
          },
          UpdateExpression : 'SET #pdfUrl = :pdf, #date = :date, #updateTime = :updateTime',
          ExpressionAttributeNames: {
              '#pdfUrl' : 'pdfUrl',
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
        body : "Prospectus Updated SuccessFully"
      };  
      }
  }
  catch(e){
    return e.message;
  }
  
};


async function pdfUpdate(name,base64){
  try{
    let encodedData = base64;
        let pdf = Buffer.from(encodedData, 'base64');
        var bucketParams = {
        Bucket:'web-dav-sanford',
        Key: `prospectus/${name}`,
        Body:pdf,
        ContentType: 'application/pdf'
    };
    console.log(bucketParams);
    const link=await s3.upload(bucketParams).promise();
    return{
          status : "true",
          body :  link['Location']
        };
    
  }catch(e){
    return e.message;
  }
}