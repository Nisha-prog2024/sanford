var aws = require('aws-sdk')
var dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log("Event body : ", event);
    if (event['type'] == "" || event['type'] == undefined) {
      return {
        statusCode: 200,
        body: "Type is required"
      };
    }
    
    let data;
    let params;
    
    switch (event['type'].toLowerCase()) {
      case "expanse":
        params = {
          TableName: 'sanford_accounting_review',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#credit = :val2)",
          ExpressionAttributeNames: {
            '#credit': 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val2': "0.00"
          },
          ScanIndexForward: false,
        };
        console.log(params);
        data = await dynamodb.query(params).promise();
        console.log(data);
        if (data['Items'] != undefined) {
          return {
            statusCode: 200,
            body: data
          };
        } else {
          return {
            statusCode: 404,
            body: "No Expanse Data Available For Review"
          };
        }
        case "income":
          params = {
            TableName: 'sanford_accounting_review',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#debit = :val2)",
            ExpressionAttributeNames: {
              '#debit': 'debit'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': "0.00"
            },
            ScanIndexForward: false,
          };
          console.log(params);
          data = await dynamodb.query(params).promise();
          console.log(data);
          if (data['Items'] != undefined) {
            return {
              statusCode: 200,
              body: data
            };
          } else {
            return {
              statusCode: 404,
              body: "No Income Data For Review Available"
            };
          }
  
        default:
          return{
              statusCode : 401,
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
