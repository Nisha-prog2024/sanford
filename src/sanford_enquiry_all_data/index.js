var aws=require('aws-sdk')
var dynamodb=new aws.DynamoDB.DocumentClient();
exports.handler = async (event) => {
    try{
        
        const params={
           TableName:"dav_sanford_enquiry",
           IndexName: "pk-tstamp-index",
           KeyConditionExpression: 'pk = :pk AND tstamp <= :st',
           ExpressionAttributeValues: {
               ':pk' : "1",
               ':st' : Number(Date.now())
           },
           ScanIndexForward:false, 
        };
        let data=await dynamodb.query(params).promise();
        console.log(data);
        
        if(data['Items'] != undefined){
            return{
                statusCode:200,
                body:data
            };
        }
        else{
          return {
            statusCode : 404,
            body : "No Enquiry Available"
          }
        }
    }catch(e){
        return{
            statusCode:500,
            body:e.message
        };
    }
};
