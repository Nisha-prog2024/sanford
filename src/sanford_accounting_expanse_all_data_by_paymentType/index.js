let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {

    console.log("Event Body : ", event);
    let params;
    let data;
    switch (event['paymentType'].toLowerCase()) {
      case "cash":
        params = {
          TableName: 'sanford_accounting_income_collection',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#paymentType = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#paymentType': 'paymentType',
            '#credit': 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "cash",
            ':val2': "0.00"
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

      case "bank":
        params = {
          TableName: 'sanford_accounting_income_collection',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#paymentType = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#paymentType': 'paymentType',
            '#credit': 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "bank",
            ':val2': "0.00"
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
      default :
        return {
          statusCode : 400,
          body : "Invalid Type"
        };

    }


  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    };
  }

};