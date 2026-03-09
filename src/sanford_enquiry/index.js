var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        console.log(event);
        if(event['phone'] == null || event['name'] == null|| event['email'] == null || event['message'] == null || event['enquiryFor'] == null){
            return{
                statusCode : 500,
                body : "Missing Required Parameters"
            };
        }
        var time = new Date();
        var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        var timeList = dateTime.split(',');
        var time1 = timeList[1].trim();
        var date = timeList[0].trim();
        const auto = "enq" + await auto_num();
        console.log(auto);

        var params = {
            TableName: 'dav_sanford_enquiry',
            Item: {
                "id": auto,
                "name": event['name'],
                "email": event['email'],
                "phone": event['phone'],
                "message" : event['message'],
                "enquiryFor" : event['enquiryFor'],
                "Date": date,
                "time": time1,
                "pk" : "1",
                "tstamp" : Number(Date.now())
            }
        };
        console.log(params);
        await dynamodb.put(params).promise();
        
        return {
            statusCode: 200,
            body: {
                "message": "Enquiry is submit sucessfully",
            }
        };

    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};

async function auto_num() {
    try {
        const auto_num = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        return auto_num;
    } catch (e) {
        return e.message;
    }
}
