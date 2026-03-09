let aws=require('aws-sdk');
let dynamodb=new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();
const bucket = "web-dav-sanford";
exports.handler = async (event) => {
try{
  
  console.log(event);
  if(event['id'] == null){
    return{
      statusCode : 404,
      body : "Id is required"
    }
  }
  const params={
    TableName:"dav_sanford_carrier",
    Key:{
      "id":event['id']
    }
  };
  console.log(params);
  let check=await dynamodb.get(params).promise();
  console.log(check);
  if(check['Item']==undefined){
    return{
      statusCode:404,
      body:"Id not found"
    }
  }
  let notFound="";
  let deletePdf=await deleteFromS3(check['Item']['link']);
  console.log(deletePdf);
  if(deletePdf!=true){
     notFound=check['Item']['link'];
  }
  await dynamodb.delete(params).promise();
  return{
    statusCode:200,
    body:"Deleted",
    notFound:notFound
  }
}catch(e){
  return{
    statusCode:500,
    body:e.message
  }
}
};

async function deleteFromS3(url){
  try{
    url=decodeURI(url);
    url=url.split('/')[3]+"/"+url.split('/')[4];
    console.log(url);
     const Bucket = bucket;
    console.log(Bucket);
const Prefix =url;
console.log(Prefix);
const MaxKeys = 1; // If a single object is found, the folder exists.
let params = {
      Bucket,
      Prefix,
      MaxKeys
};
  let ch= await  s3.listObjectsV2(params).promise();
        
        if(ch['KeyCount']!=0)
      {
         
    const params={
          Bucket:bucket,
          Key:  url                             // 'some/subfolders/nameofthefile1.extension'
    }
let ch=await s3.deleteObject(params).promise(); 
console.log(ch);
return true;
}
return false;
  }catch(e){
    return e.message;
  }
}














// var aws = require('aws-sdk');
// var dynamodb = new aws.DynamoDB.DocumentClient();
// var s3 = new aws.S3();

// exports.handler = async (event) => {
//     try {
//         console.log(event);

//         if (event['id'] == undefined || event['id'] == "") {
//             return {
//                 statusCode: 404,
//                 body: "Id is required"
//             };
//         }

//         let Dparams = {
//             TableName: "dav_sanford_carrier",
//             Key: {
//                 "id": event['id']
//             }
//         };
//         console.log(Dparams);
//         let data = await dynamodb.get(Dparams).promise();
//         console.log(data);
//         console.log(data['Item']);
//         if (data['Item'] == undefined) {
//             return {
//                 statusCode: 404,
//                 body: "Id not found"
//             };
//         }
//         let file_name = data['Item']['pdfUrl'].split('/')[3] + "/" + data['Item']['pdfUrl'].split('/')[4];
//         console.log(file_name);
//         file_name = decodeURI(file_name);

//         const params = {
//             Bucket: "web-dav-sanford",
//             Key: file_name                              // 'some/subfolders/nameofthefile1.extension'
//         };
//         console.log(params);
//         let ch = await s3.deleteObject(params).promise();
//         console.log(ch);

//         await dynamodb.delete(Dparams).promise();
//         return {
//             statusCode: 200,
//             body: "Deleted Sucessfully"
//         };


//     } catch (e) {
//         return {
//             statusCode: 500,
//             body: e.message
//         };
//     }
// };
