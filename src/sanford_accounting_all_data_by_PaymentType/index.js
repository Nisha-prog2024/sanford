let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log("Event Body : ", event);

    if (event['paymentType'] == undefined || event['paymentType'] == "") {
      return {
        statusCode: 400,
        body: "Payment Type is Required"
      }
    }
    let data;
    let params;

    switch (event['paymentType'].toLowerCase()) {
      case "bank":
      case 'cash':
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "#paymentType = :val1",
          ExpressionAttributeNames: {
            '#paymentType': 'paymentType'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': event['paymentType'].toLowerCase(),
          },
          ScanIndexForward: false,
        };
        console.log(params);
        data = await dynamodb.query(params).promise();
        console.log(data);
        if (data['Items'] != undefined && data['Items'].length != 0) {
          return {
            statusCode: 200,
            body: data
          };
        } else {
          return {
            statusCode: 404,
            body: "No Data Available"
          };
        }
      case 'all':
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',

          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now())
          },
          ScanIndexForward: false,
        };
        console.log(params);
        data = await dynamodb.query(params).promise();
        console.log(data);
        if (data['Items'] != undefined && data['Items'].length != 0) {
          return {
            statusCode: 200,
            body: data
          };
        } else {
          return {
            statusCode: 404,
            body: "No Data Available"
          };
        }

      default:
        return {
          statusCode: 400,
          body: "Invalid Type"
        }

    }

  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    };
  }

};