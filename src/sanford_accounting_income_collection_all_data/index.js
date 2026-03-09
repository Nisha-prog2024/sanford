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
      case "donation":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "donation",
            ':val2' : "0.00",
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

      case "events":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
        
         case "fee":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "fee",
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
        
      case "other":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit'
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
      case "all":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#debit = :val2)",
          ExpressionAttributeNames: {
            '#debit' : 'debit'
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
      default :
        return{
          statusCode : 401,
          body : "Invalid Type"
        };
    }
    }
    else{
      
    
    switch (event['type'].toLowerCase()) {
      case "donation":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "donation",
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

      case "events":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
        case "fee":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
            '#creatorRole' : 'creatorRole'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': "fee",
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
      case "other":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#type = :val1 AND #debit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#type': 'type',
            '#debit' : 'debit',
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
      case "all":
        params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "(#debit = :val2 AND #creatorRole = :val3)",
          ExpressionAttributeNames: {
            '#debit' : 'debit',
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
            statusCode: 404,
            body: "No Data Available"
          };
        }
      default :
        return{
          statusCode : 401,
          body : "Invalid Type"
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

// async function admin(event){
  
//   let params;
//   let data;
//   console.log(event['type'].toLowerCase())
//   switch (event['type'].toLowerCase()) {
//       case "donation":
//         params = {
//           TableName: 'sanford_accounting',
//           IndexName: 'pk-tstamp-index',
//           KeyConditionExpression: 'pk = :no AND tstamp <= :st',
//           FilterExpression: "(#type = :val1 AND #debit = :val2)",
//           ExpressionAttributeNames: {
//             '#type': 'type',
//             '#debit' : 'debit',
//           },
//           ExpressionAttributeValues: {
//             ':no': "1",
//             ':st': Number(Date.now()),
//             ':val1': "donation",
//             ':val2' : "0.00"
//           },
//           ScanIndexForward: false,
//         };
//         console.log("Donation Params : ",params);
//         data = await dynamodb.query(params).promise();
//         console.log("Data : ",data);
//         if (data['Items'] != undefined) {
//           console.log("Under if condition")
//           return { 
//             statusCode: 200,
//             body: data
//           };
//         } else {
//           console.log("under else");
//           return {
//             statusCode: 404,
//             body: "No Data Available"
//           };
//         }

//       case "events":
//         params = {
//           TableName: 'sanford_accounting',
//           IndexName: 'pk-tstamp-index',
//           KeyConditionExpression: 'pk = :no AND tstamp <= :st',
//           FilterExpression: "(#type = :val1 AND #debit = :val2)",
//           ExpressionAttributeNames: {
//             '#type': 'type',
//             '#debit' : 'debit',
//             '#creatorRole' : 'creatorRole'
//           },
//           ExpressionAttributeValues: {
//             ':no': "1",
//             ':st': Number(Date.now()),
//             ':val1': "events",
//             ':val2' : "0.00"
//           },
//           ScanIndexForward: false,
//         };
//         console.log(params);
//         data = await dynamodb.query(params).promise();
//         console.log(data);
//         if (data['Items'] != undefined) {
//           return {
//             statusCode: 200,
//             body: data
//           };
//         } else {
//           return {
//             statusCode: 404,
//             body: "No Data Available"
//           };
//         }
//       case "other":
//         params = {
//           TableName: 'sanford_accounting',
//           IndexName: 'pk-tstamp-index',
//           KeyConditionExpression: 'pk = :no AND tstamp <= :st',
//           FilterExpression: "(#type = :val1 AND #debit = :val2)",
//           ExpressionAttributeNames: {
//             '#type': 'type',
//             '#debit' : 'debit'
//           },
//           ExpressionAttributeValues: {
//             ':no': "1",
//             ':st': Number(Date.now()),
//             ':val1': "other",
//             ':val2' : "0.00"
//           },
//           ScanIndexForward: false,
//         };
//         console.log(params);
//         data = await dynamodb.query(params).promise();
//         console.log(data);
//         if (data['Items'] != undefined) {
//           return {
//             statusCode: 200,
//             body: data
//           };
//         } else {
//           return {
//             statusCode: 404,
//             body: "No Data Available"
//           };
//         }
//       case "all":
//         params = {
//           TableName: 'sanford_accounting',
//           IndexName: 'pk-tstamp-index',
//           KeyConditionExpression: 'pk = :no AND tstamp <= :st',
//           FilterExpression: "(#debit = :val2)",
//           ExpressionAttributeNames: {
//             '#debit' : 'debit'
//           },
//           ExpressionAttributeValues: {
//             ':no': "1",
//             ':st': Number(Date.now()),
//             ':val2' : "0.00"
//           },
//           ScanIndexForward: false,
//         };
//         console.log(params);
//         data = await dynamodb.query(params).promise();
//         console.log(data);
//         if (data['Items'] != undefined) {
//           return {
//             statusCode: 200,
//             body: data
//           };
//         } else {
//           return {
//             statusCode: 404,
//             body: "No Data Available"
//           };
//         }
//       default :
//         return{
//           statusCode : 401,
//           body : "Invalid Type"
//         };
//     }
// }