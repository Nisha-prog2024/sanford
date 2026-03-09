let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {

    console.log("Event Body : ", event);
    if(event['role'] == "" || event['role'] == undefined || event['type'] == "" || event['type'] == undefined){
      return{
        statusCode : 400,
        body : "Invalid Request : Type/Role Are Required "
      };
    }
    let params;
    let data;
    if(event['role'].toLowerCase() == "admin"){
      switch (event['type'].toLowerCase()) {
      case "purchases":
        params = { 
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "purchases",
            ':val2' : "0.00"
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
            statusCode: 200,
            body: "No Data Available"
          };
        }

      case "events":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "events",
            ':val2' : "0.00"
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "logistic":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "logistic",
            ':val2' : "0.00"
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
            body: "No Data Available"
          };
        }
      case "salary":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit'
            
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "salary",
            ':val2' : "0.00"
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "other":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "other",
            ':val2' : "0.00"
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "all":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#credit = :val2)",
          ExpressionAttributeNames: {
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val2' : "0.00"
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
            statusCode: 202,
            body: "No Data Available"
          };
        }
        default :
          return{
            statusCode : 400,
            body : "Invalid Type"
          };
    }
    }
    else{
      
    
    switch (event['type'].toLowerCase()) {
      case "purchases":
        params = { 
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "purchases",
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            statusCode: 200,
            body: "No Data Available"
          };
        }

      case "events":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "events",
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "logistic":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "logistic",
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            body: "No Data Available"
          };
        }
      case "salary":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
            
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "salary",
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "other":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "other",
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            statusCode: 200,
            body: "No Data Available"
          };
        }
      case "all":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#credit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#credit' : 'credit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val2' : "0.00",
            ':val3' : event['role'].toLowerCase()
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
            statusCode: 202,
            body: "No Data Available"
          };
        }
        default :
          return{
            statusCode : 400,
            body: "Invalid Type"
          };
    }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: e.message
    };
  }

};