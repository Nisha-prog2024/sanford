const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // TODO implement
  try{
      console.log(event);
      
      if(event['image']== "" || event['image'] == undefined || event['title']=="" || event['title'] == undefined || event['description'] == "" || event['description'] == undefined){
        return {
          statusCode : 404,
          body : "Image/title/description is required"
        };
      }
      
      var time = new Date();
      var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      var timeList = dateTime.split(',');
      var date = timeList[0].trim();
      time = timeList[1].trim();
      console.log(time);
      console.log(date);
      
      let link = await imageupdate(event['image']['name'],event['image']['base64']);
      console.log(link);
      var id = "id"+ Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
      
      if(link['status'] == "true"){
        const params = {
          TableName: 'dav_sanford_facility', 
          Item : {
            'id' : id,
            'imageUrl' : link['body'],
            'title' : event['title'],
            'description' : event['description'],
            'date' : date, 
            'time' : time,
            'pk' : "1",
            'tstamp' : Number(Date.now())
          }
        };
        console.log(params);
        await dynamodb.put(params).promise();
      
        return {
          statusCode : 200,
          body : "Facility Added SuccessFully"
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

async function imageupdate(name,base64){
  try{
        let encodedData = base64;
        let image = Buffer.from(encodedData.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var bucketParams = { 
            Bucket: "web-dav-sanford",
            Key: `facility/${name}`, 
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
