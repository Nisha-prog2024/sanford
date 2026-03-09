const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const params = {
            TableName: 'dav_sanford_events',
            Key: {
                id: event['id']
            }
        };
        console.log(params);
        let check=await dynamodb.get(params).promise();
        console.log(check);
        if(check['Item']==undefined){
          return{
            statusCode:404,
            body:"property not found"
          }
        }


        var time = new Date();
        var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const param = {
            TableName: 'dav_sanford_events',
            Key: {
                "id": event['id']
            },
            UpdateExpression: 'set #event_status = :newEvent_status, #date = :date, #tstamp = :timestamp',
            ExpressionAttributeNames: {
                '#event_status': 'event_status',
                '#date': event['event_status']+"_"+"date",
                '#tstamp': 'tstamp'
            },
            ExpressionAttributeValues: {
                ':newEvent_status': event['event_status'].toLowerCase(),
                ':date': dateTime,
                ':timestamp': Number(Date.now())
            }
        };
        await dynamodb.update(param).promise();
        return {
            statusCode:200,
            body:"status updated"
        }


    }catch(e){
        return{
            statusCode:500,
            body:e.message
        }
    }
          
};