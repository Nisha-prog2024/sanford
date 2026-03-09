
var aws=require('aws-sdk');
var dynamodb =new aws.DynamoDB.DocumentClient();
var s3=new aws.S3();
var bucket="web-dav-sanford";
exports.handler = async (event) => {
 try{
let data=await allBucketKeys(event,s3,bucket);
console.log(data);
// let Fdata=[...new Set(data)];

return{
  statusCode:200,
body:data
}

 }catch(e){
   return{
     statusCode:500,
     body:e.message
   }
 }
};

async function allBucketKeys(event,s3, bucket) {
  const params = {
    Bucket: bucket,
    Prefix:"poster_image/"
  };
console.log(params);
  var keys = [];
  for (;;) {
    var data = await s3.listObjects(params).promise();
    console.log(data)

    data.Contents.forEach((elem,i) => {
      if(i!=0){
    let  url=decodeURI("https://web-dav-sanford.s3.ap-south-1.amazonaws.com/poster_image/");
      keys = keys.concat(url + elem.Key.split('/')[1]);
      } 
    });

    if (!data.IsTruncated) {
      break;
    }
    params.Marker = data.NextMarker;
  }

  return keys; 
}


// const AWS = require('aws-sdk');
// let dynamodb=new AWS.DynamoDB.DocumentClient();
// const s3 = new AWS.S3();

// exports.handler = async (event) => {
//   // TODO implement
//   try{
//       console.log(event);
      
//       if (Array.isArray(event['image']) == false) {
//       return {
//         statusCode: 400,
//         body: "file_name should be in array"
//       }
//     }
      
//       var time = new Date();
//       var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
//       var timeList = dateTime.split(',');
//       var date = timeList[0].trim();
//       time = timeList[1].trim();
//       console.log(time);
//       console.log(date);
      
//       for (let imageUrl of event['image']){
//         var id = "id"+ Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
//         const params = {
//           TableName: 'dav_sanford_poster_images', 
//           Item : {
//             'id' : id,
//             'imageUrl' : imageUrl,
//             'date' : date, 
//             'time' : time,
//             'pk' : "1",
//             'tstamp' : Number(Date.now())
//           }
//         }
//         console.log(params);
//         await dynamodb.put(params).promise();
//       }
      
//         return {
//           statusCode : 200,
//           body : "Images Uploaded SuccessFully"
//         };
      
//   }
//   catch(e){
//     return {
//       statusCode : 500,
//       body : e.message
//     };
//   }
  
// };