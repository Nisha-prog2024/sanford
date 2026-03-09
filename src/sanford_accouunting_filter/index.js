let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // TODO implement
  try {
    console.log("Event body : ", event);
    if (event['transactionDate'] == "" || event['transactionDate'] == undefined || event['type'] == "" || event['type'] == undefined || event['subType'] == "" || event['subType'] == undefined || event['paymentType'] == "" || event['paymentType'] == undefined) {
      return {
        statusCode: 400,
        body: "transactionDate/Type/SubType/PaymentType is require"
      };
    }
    
    
    let getParams = {
      TableName : 'sanford_accounting',
      Key : {
        'transactionId' : "startingBalance"
      } 
    };
    
    let startingBalance = await dynamodb.get(getParams).promise();
    console.log("Starting Balance : ",startingBalance);
    
    
    let params;

    switch (event['type'].toLowerCase()) {
      case 'income':
        console.log("Type : ",event['type']);
        if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          console.log("conditionn 1");
          
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #debit= :val2 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#debit': 'debit',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          console.log("conditionn 2");
          params = { 
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#debit= :val2)",
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
        }
        else if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          console.log("conditionn 2");
          params = { 
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#debit= :val2 AND #paymentType = :val3)",
            ExpressionAttributeNames: {
              '#debit': 'debit',
              '#paymentType' : 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': "0.00",
              ':val3' : event['paymentType']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#debit= :val2 AND #transactionDate = :val3)",
            ExpressionAttributeNames: {
              '#debit': 'debit',
              '#transactionDate' : 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': "0.00",
              ':val3' : event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          console.log("conditionn 3");
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #debit= :val2 AND #subType = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#debit': 'debit',
              '#subType': 'type'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['subType'].toLowerCase()
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
         console.log("conditionn 4");
           params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #debit= :val2 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#debit': 'debit',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          console.log("conditionn 5");
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #debit= :val2)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#debit': 'debit'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00"
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          console.log("conditionn 5");
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #debit= :val2 AND #paymentType = :val3 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#debit': 'debit',
              '#transactionDate' : 'transactionDate',
              '#paymentType' : 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00",
              ':val3' : event['paymentType'].toLowerCase(),
              ':val4' : event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        break;
      case 'expanse':
        if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #credit= :val2 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#credit': 'credit',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#credit= :val2)",
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
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#credit= :val2 AND #transactionDate = :val3)",
            ExpressionAttributeNames: {
              '#credit': 'credit',
              '#transactionDate' : 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': "0.00",
              ':val3' : event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#credit= :val2 AND #paymentType = :val3)",
            ExpressionAttributeNames: {
              '#credit': 'credit',
              '#paymentType' : 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': "0.00",
              ':val3' : event['paymentType']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #credit= :val2 AND #subType = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#credit': 'credit',
              '#subType': 'type'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['subType'].toLowerCase()
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #credit= :val2 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#credit': 'credit',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00",
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #credit= :val2)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#credit': 'credit'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00"
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          console.log("conditionn 5");
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #credit= :val2 AND #paymentType = :val3 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#credit': 'credit',
              '#transactionDate' : 'transactionDate',
              '#paymentType' : 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val2': "0.00",
              ':val3' : event['paymentType'].toLowerCase(),
              ':val4' : event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        
        break;
      case 'all':
        if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            // FilterExpression: "(#debit= :val2)",
            // ExpressionAttributeNames: {
            //   '#debit': 'debit'
            // },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              // ':val2': "0.00"
            },
            ScanIndexForward: false,
          };
          console.log("All case params : ",params);
        }
        else if (event['subType'] == "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#transactionDate = :val2)",
            ExpressionAttributeNames: {
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] == "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType= :val2)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val2': event['paymentType']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#paymentType = :val1 AND #subType = :val4)",
            ExpressionAttributeNames: {
              '#paymentType': 'paymentType',
              '#subType': 'type'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['paymentType'].toLowerCase(),
              ':val4': event['subType'].toLowerCase()
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] != "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#transactionDate': 'transactionDate'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val4': event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] == "all" && event['transactionDate'] == "all") {
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1)",
            ExpressionAttributeNames: {
              '#subType': 'type'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        else if (event['subType'] != "all" && event['paymentType'] != "all" && event['transactionDate'] != "all") {
          console.log("conditionn 5");
          params = {
            TableName: 'sanford_accounting',
            IndexName: 'pk-tstamp-index',
            KeyConditionExpression: 'pk = :no AND tstamp <= :st',
            FilterExpression: "(#subType = :val1 AND #paymentType = :val3 AND #transactionDate = :val4)",
            ExpressionAttributeNames: {
              '#subType': 'type',
              '#transactionDate' : 'transactionDate',
              '#paymentType' : 'paymentType'
            },
            ExpressionAttributeValues: {
              ':no': "1",
              ':st': Number(Date.now()),
              ':val1': event['subType'].toLowerCase(),
              ':val3' : event['paymentType'].toLowerCase(),
              ':val4' : event['transactionDate']
            },
            ScanIndexForward: false,
          };
          console.log(params);
        }
        break;
      default:
        return {
          statusCode: 400,
          body: "Invalid Type"
        };
    }



    let data = await dynamodb.query(params).promise();
    console.log(data);
    if (data['Items'] != undefined && data['Items'].length != 0) {
      // let overallbalance = 0;
      // for(const item of data['Items']){
      //   const creditAmount = Number(item['credit']) || 0;
      //   const debitAmount = Number(item['debit']) || 0;
        
      //   overallbalance += (creditAmount - debitAmount);
        
      // } 
      // console.log("overallbalance : ",overallbalance);
      return {
        statusCode: 200,
        body: data,
        startingBalance : {
          bank : startingBalance['Item']['bank'],
          cash : startingBalance['Item']['cash']
        }
      };
    } else {
      return { 
        statusCode: 200,
        body:{
          Items:[]
        }
      };
    }

  }
  catch (e) {
    return {
      statusCode: 500,
      body: e.message

    };
  }
};
