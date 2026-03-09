let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
     
        // let exclusiveStartKey = null;
        // if (event && event['lastKey']) {
        //     exclusiveStartKey = event['lastKey'];
        // }
    
        let params={
            TableName:'dav_sanford_events',
            IndexName:'pk-tstamp-index',
              KeyConditionExpression: 'pk = :no AND tstamp <= :st',
         FilterExpression: "(begins_with(#event_status,:val1))",
         ExpressionAttributeNames: {
                '#event_status':'event_status'
          },
          ExpressionAttributeValues: {
            ':no':"1",
             ':st':Number(Date.now()), 
             ':val1':event['event_status'].toLowerCase()
          },
        ProjectionExpression: "id, event_name, message, event_status, event_date, event_time, place, imageUrl", 
        // ExclusiveStartKey:exclusiveStartKey,
        //   Limit:event['limit'],
          ScanIndexForward: false,
        };
        console.log(params);
        
        let data = await dynamodb.query(params).promise();
        console.log(data);
        
        const lastEvaluatedKey = data.LastEvaluatedKey;
        console.log(lastEvaluatedKey);
        
        return {
            statusCode: 200,
            body: data,
            // startKey : exclusiveStartKey
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }

};