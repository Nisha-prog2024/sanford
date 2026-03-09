const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Validate event payload
    if (!event || !event.type || !event.paymentType || !event.amount) {
      return {
        statusCode: 400,
        body: "Invalid event payload"
      };
    }

    // Log event body
    console.log("Event Body : ", event);

    // Generate transaction ID
    let transactionId = "Trnx" + Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);

    // Get current date and time in Asia/Kolkata timezone
    var time = new Date();
    var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    var timeList = dateTime.split(',');
    var date = timeList[0].trim();
    time = timeList[1].trim();
    console.log(time);
    console.log(date);

    // Extract month and year from the date
    let month = date.split('/')[1];
    let year = date.split('/')[2];
    console.log("month : ", month);
    console.log("year : ", year);

    // Retrieve credit and debit data
    const creditData = await getItemsByType('credit', event.paymentType.toLowerCase());
    const debitData = await getItemsByType('debit', event.paymentType.toLowerCase());

    console.log("Credit Data : ", creditData);
    console.log("Debit Data : ", debitData);

    // Calculate total credit and debit amounts
    const totalCredit = calculateTotalAmount(creditData, "credit");
    const totalDebit = calculateTotalAmount(debitData, "debit");

    let total = (totalCredit - totalDebit) + Number(event.amount);
    console.log("Total Credit : ", totalCredit);
    console.log("Total debit : ", totalDebit);
    console.log("Total : ", total);

    total = total.toFixed(2);

    // Construct params based on event type
    let params;
    switch (event.type.toLowerCase()) {
      case 'donation':
      case 'fee':
      case 'events':
      case 'other':
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: event.type.toLowerCase(),
            subType: event.subtype.toLowerCase(),
            from: event.from,
            to: event.to,
            creatorRole: event.creatorRole.toLowerCase(),
            creatorName: event.creatorName.toLowerCase(),
            creatorId: event.creatorId,
            description: event.description.toLowerCase(),
            credit: event.amount,
            debit: "0.00",
            amount: event.amount,
            paymentType: event.paymentType.toLowerCase(),
            total: total,
            month: month,
            year: year,
            review: "false",
            pk: "1",
            tstamp: Number(Date.now())
          }
        };
        console.log("Params : ", params);
        break;
      default:
        return {
          statusCode: 400,
          body: "Invalid type"
        };
    }

    // Insert data into DynamoDB
    await dynamodb.put(params).promise();

    // Update starting balance
    let getParams = {
      TableName: 'sanford_accounting',
      Key: {
        'transactionId': 'startingBalance'
      }
    };

    let data = await dynamodb.get(getParams).promise();
    console.log("starting Balance : ", data);

    if (data.Item !== undefined) {
      let totalStartingBalance = Number(data.Item[event.paymentType.toLowerCase()]) + Number(event.amount);
      let putParams = {
        TableName: 'sanford_accounting',
        Key: {
          'transactionId': 'startingBalance'
        },
        UpdateExpression: 'SET #paymentType = :val1',
        ExpressionAttributeNames: {
          '#paymentType': event.paymentType.toLowerCase()
        },
        ExpressionAttributeValues: {
          ':val1': totalStartingBalance.toFixed(2)
        }
      };
      console.log("Put Params : ", putParams);
      await dynamodb.update(putParams).promise();
    }

    return {
      statusCode: 200,
      body: 'Income collection details stored successfully',
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};

// Function to retrieve items from DynamoDB based on type (credit/debit)
const getItemsByType = async (type, paymentType) => {
  const params = {
    TableName: 'sanford_accounting',
    FilterExpression: ' ( #type <> :val AND #paymentType = :val1)',
    ExpressionAttributeNames: {
      '#paymentType': 'paymentType',
      '#type': type,
    },
    ExpressionAttributeValues: {
      ':val': '0.00',
      ':val1': paymentType
    },
  };
  console.log("params : ", params);
  const result = await dynamodb.scan(params).promise();
  console.log("Credit / Debit Result : ", result);
  return result.Items || [];
};

// Function to calculate total amount from an array of items
const calculateTotalAmount = (items, type) => {
  let total = 0;

  for (const item of items) {
    console.log(`${type} Amount : `, item[type]);
    total += Number(item[type]);
  }
  return total;
};



// const AWS = require('aws-sdk');
// const dynamodb = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event) => {
//   try {
//     console.log("Event Body : ", event);
//     let params;

//     let transactionId = "Trnx" + Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);

//     var time = new Date();
//     var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
//     var timeList = dateTime.split(',');
//     var date = timeList[0].trim();
//     time = timeList[1].trim();
//     console.log(time);
//     console.log(date);
    
//     let month = date.split('/')[1];
//     let year = date.split('/')[2];
//   console.log("month : ",month);
//     console.log("year : ",year);
  
//     const creditData = await getItemsByType('credit',event['paymentType'].toLowerCase());
//     const debitData = await getItemsByType('debit',event['paymentType'].toLowerCase());
    
//     console.log("Credit Data : ",creditData);
//     console.log("Debit Data : ",debitData);

//     // Calculate total credit and debit amounts
//     const totalCredit = calculateTotalAmount(creditData,"credit");
//     const totalDebit = calculateTotalAmount(debitData,"debit");
    
//     let total = (totalCredit - totalDebit) + Number(event['amount']);
//     console.log("Total Credit : ",totalCredit);
//     console.log("Total debit : ",totalDebit);
//     console.log("Total : ",total);
    
//     total = total.toFixed(2);
    

//     switch (event['type'].toLowerCase()) {
//       case 'donation':
//         params = { 
//           TableName: "sanford_accounting",
//           Item: {
//             transactionId: transactionId,
//             transactionDate: date,
//             transactionTime: time,
//             type: "donation",
//             subType : event['subtype'].toLowerCase(),
//             from: event['from'],
//             to : event['to'],
//             creatorRole : event['creatorRole'].toLowerCase(),
//             creatorName : event['creatorName'].toLowerCase(),
//             creatorId : event['creatorId'],
//             description: event['description'].toLowerCase(),
//             credit: event['amount'],
//             debit: "0.00",
//             amount: event['amount'],
//             paymentType : event['paymentType'].toLowerCase(),
//             total : total,
//             month : month,
//             year : year,
//             review : "false",
//             pk : "1",
//             tstamp : Number(Date.now())

//           } 
//         };
//         console.log("Params : ",params);
//         break;
//       case 'fee':
//         params = { 
//           TableName: "sanford_accounting",
//           Item: {
//             transactionId: transactionId,
//             transactionDate: date,
//             transactionTime: time,
//             type: "fee",
//             subType : event['subtype'],
//             from: event['from'],
//             to : event['to'],
//             creatorRole : event['creatorRole'].toLowerCase(),
//             creatorName : event['creatorName'].toLowerCase(),
//             creatorId : event['creatorId'],
//             description: event['description'].toLowerCase(),
//             credit: event['amount'],
//             debit: "0.00",
//             amount: event['amount'],
//             paymentType : event['paymentType'].toLowerCase(),
//             total : total,
//             month : month,
//             year : year,
//             review : "false",
//             pk : "1",
//             tstamp : Number(Date.now())

//           }
//         };
//         console.log("Params : ",params);
//         break;
//       case 'events':
//         params = {
//           TableName: "sanford_accounting",
//           Item: {
//             transactionId: transactionId,
//             transactionDate: date,
//             transactionTime: time,
//             type: "events",
//             subType : event['subtype'].toLowerCase(),
//             from: event['from'],
//             to : event['to'],
//             creatorRole : event['creatorRole'].toLowerCase(),
//             creatorName : event['creatorName'].toLowerCase(),
//             creatorId : event['creatorId'], 
//             description: event['description'].toLowerCase(),
//             credit: event['amount'],
//             debit: "0.00",
//             amount : event['amount'],
//             paymentType : event['paymentType'].toLowerCase(),
//             total : total,
//             month : month,
//             year : year,
//             review : "false",
//             pk : "1",
//             tstamp : Number(Date.now())

//           }
//         };
//         console.log("Params : ",params);
//         break;
//       case 'other':
//         params = {
//           TableName: "sanford_accounting",
//           Item: {
//             transactionId: transactionId,
//             transactionDate: date,
//             transactionTime: time,
//             type: "other",
//             subType : event['subtype'].toLowerCase(),
//             from: event['from'],
//             to : event['to'],
//             creatorRole : event['creatorRole'].toLowerCase(),
//             creatorName : event['creatorName'].toLowerCase(),
//             creatorId : event['creatorId'],
//             description: event['description'].toLowerCase(),
//             credit: event['amount'],
//             debit: "0.00",
//             amount: event['amount'],
//             paymentType : event['paymentType'].toLowerCase(),
//             total : total,
//             month : month,
//             year : year,
//             review : "false",
//             pk : "1",
//             tstamp : Number(Date.now())

//           }
//         };
//         console.log("Params : ",params);
//         break;
//       default:
//         return {
//           statusCode: 400,
//           body: "Invalid type"
//         };
//     }
    
    
//     await dynamodb.put(params).promise();
    
//     let getParams = {
//       TableName : 'sanford_accounting',
//       Key : {
//         'transactionId' : 'startingBalance'
//       }
//     };
    
//     let data = await dynamodb.get(getParams).promise();
//     console.log("starting Balance : ",data);
    
//     if(data['Item'] != undefined){
//       let totalStartingBalance = Number(data['Item'][event['paymentType'].toLowerCase()] ) + Number(event['amount']);
//       let putParams = {
//       TableName : 'sanford_accounting',
//       Key : {
//         'transactionId' : 'startingBalance'
//       },
//       UpdateExpression : 'SET #paymentType = :val1',
//       ExpressionAttributeNames: {
//         '#paymentType' : event['paymentType'].toLowerCase()
//       },
//       ExpressionAttributeValues: {
//         ':val1' : totalStartingBalance.toFixed(2)
//       }
//     };
//     console.log("Put Params : ",putParams);
//     await dynamodb.update(putParams).promise();
//     }
    
    
//     return {
//       statusCode: 200,
//       body: 'Income collection details stored successfully',
//     };


//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: error.message,
//     };
//   }
// };


// // Function to retrieve items from DynamoDB based on type (credit/debit)
// const getItemsByType = async (type,paymentType) => {
//   const params = {
//     TableName: 'sanford_accounting',
//     FilterExpression: ' ( #type <> :val AND #paymentType = :val1)',
//     ExpressionAttributeNames: {
//         '#paymentType': 'paymentType',
//         '#type': type,
//     },
//     ExpressionAttributeValues: {
//       ':val' : '0.00',
//       ':val1' : paymentType
//     },
//   };
//   console.log("params : ",params);
//   const result = await dynamodb.scan(params).promise();
//   console.log("Credit / Debit Result : ",result);
//   return result.Items || [];
// };

// // Function to calculate total amount from an array of items
// const calculateTotalAmount = (items,type) => {
//   let total = 0;
  
//   for(const item of items){
//     console.log(`${type} Amount : `,item[type]);
//     total += Number(item[type]);
//   }
//   return total;
  
// };