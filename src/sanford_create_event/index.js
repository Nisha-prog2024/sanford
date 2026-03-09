const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();


exports.handler = async (event) => {
  // TODO implement
  
  try{
    console.log(event);
     if(event['event_name']== "" || event['event_name'] == undefined || event['image']['base64'] == "" || event['image']['base64'] == undefined || event['image']['name'] == "" || event== undefined || ['image']['name'] || event['message']=="" || event['message'] == undefined || event['place'] == "" || event['place'] == undefined|| event['event_status'] == "" || event['event_status'] == undefined|| event['event_date'] == "" || event['event_date'] == undefined|| event['event_time'] == "" || event['event_time'] == undefined){
        return {
          statusCode : 404,
          body : "Title/Image/message/place/status/event_date/event_time is required"
        };
      }
    
    var time = new Date();
    var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    var timeList = dateTime.split(',');
    var date = timeList[0].trim();
    time = timeList[1].trim();
    console.log(time);
    console.log(date);
    var id = "id"+ Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
    
    let link = await imageupdate(event['image']['name'],event['image']['base64']);
    console.log(link);
    // let link = await imageupdate(event['images'])
    if(link['status'] == "true") {
      
    
    let params = {
      TableName : "dav_sanford_events", 
      Item : {
        'id' : id,
        'event_name' : event['event_name'],
        'imageUrl' : link['body'],
        'message' : event['message'],
        'place' : event['place'],
        'event_status' : event['event_status'].toLowerCase(),
        'create_date' : date,
        'create_time' : time,
        'event_date' : event['event_date'],
        'event_time' : event['event_time'],
        'pk' : "1",
        'tstamp' : Number(Date.now())
      }
    };
      console.log(params);
     await dynamodb.put(params).promise();
    }else{
      return {
          statusCode : 500,
          body : link
        };
    }
      
     return {
          statusCode : 200,
          body : "Event Created SuccessFully"
      };
    
  }catch(e){
    return {
      statusCode : 500,
      body : e.message
    }
  }
};


async function imageupdate(name,base64){
  try{
      
        let encodedData = base64;
        let image = Buffer.from(encodedData.replace(/^data:image\/\w+;base64,/, ""),'base64')
        var bucketParams = { 
            Bucket:"web-dav-sanford",
            Key: `events/${name}`, 
            Body:image,
            ContentEncoding: 'base64', 
            ContentType: 'image/jpeg'
        };
        console.log(bucketParams);
        const link= await s3.upload(bucketParams).promise();
      
        return{
          status : "true",
          body :  link['Location']
        };
  }
  catch(e){
    return e.message;
  }
}
