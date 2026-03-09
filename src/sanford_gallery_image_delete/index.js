var aws=require('aws-sdk');
var s3=new aws.S3();
exports.handler = async (event) => {
try{
  console.log(event);

  if(event['url']==""||event['url']==undefined||event['url']==""){
    return{
      statusCode:400,
      body:"Url is required"
    }
  }
  if(Array.isArray(event['url'])==false){
    return{
      statusCode:400,
      body:"Url should be in array"
    }
  }
  
  const bucket="web-dav-sanford";
const len=event['url'].length;
console.log(len);
let nf=[],j=0;
for(let i=0;i<len;i++){
    console.log(i);
  let url=event['url'][i].split('/')[3]+"/"+event['url'][i].split('/')[4];
  url=decodeURI(url);
  
console.log("url=",url);
console.log(url); 
   const Bucket = bucket;
    console.log(Bucket);
const Prefix =url;
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
          Key:  url                                // 'some/subfolders/nameofthefile1.extension'
    }
let ch=await s3.deleteObject(params).promise();
console.log(ch);
}
else{
  nf[j]=event['url'][i];
  j++;
  console.log(nf[j]);
  // return{
  //   statusCode:404,
  //   body:"Image "+event['url'][i]+" not found"
  // }
}
}
if(nf.length==len){
  return{
    statusCode:404,
    body:"No images found in s3"
  }
}
return{
    statusCode:200,
    body:"Image(s) deleted",
    not_found_images:nf
}

  
  
  
}catch(e){
  return{
    statusCode:500,
    body:e.message
  }
}
};
