const AWS = require('aws-sdk');
let dynamodb=new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
  // TODO implement
  
  try{
    console.log(event);
     if(event['video_title']== "" || event['video_title'] == undefined || event['youtube_url']=="" || event['youtube_url'] == undefined){
        return {
          statusCode : 404,
          body : "Video_title/youtube_url is required"
        };
      }
    
    var time = new Date();
    var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    var timeList = dateTime.split(',');
    var date = timeList[0].trim();
    time = timeList[1].trim();
    console.log(time);
    console.log(date);
    
    
        let url1 = event['youtube_url'];
        let url = url1.split('/');
        console.log("url "+url);
        let urlID = url[3].trim();
        console.log(urlID);
        let id =urlID.split('?');
        console.log(id);
        console.log(id[0].trim());
        let yID = id[0].trim()  

    var ide = "id"+ Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
    let params = {
      TableName : "dav_sanford_videos",
      Item : {
        'id' : ide,
        'video_title' : event['video_title'].toLowerCase(),
        'youtube_url' : yID,
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
          body : "Video Added SuccessFully"
      };
    
  }catch(e){
    return {
      statusCode : 500,
      body : e.message
    }
  }
};
