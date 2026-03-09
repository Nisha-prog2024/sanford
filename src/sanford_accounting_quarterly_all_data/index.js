// const AWS = require('aws-sdk');

// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event) => {
//   try {
//     const currentDate = new Date();
//     const lastMonth = new Date(currentDate);
//     lastMonth.setMonth(currentDate.getMonth() - 1);

//     const last3Months = new Date(currentDate);
//     last3Months.setMonth(currentDate.getMonth() - 3);

//     const last6Months = new Date(currentDate);
//     last6Months.setMonth(currentDate.getMonth() - 6);

//     const lastYear = new Date(currentDate);
//     lastYear.setFullYear(currentDate.getFullYear() - 1);


//     const convertedDate = convertDateFormat(lastMonth);
//     console.log("Converted date : ",convertedDate);

    
//     // Replace 'YourTableName' with your actual DynamoDB table name
//     const params = {
//       TableName: 'sanford_accounting',
//       IndexName: 'pk-tstamp-index',
//       KeyConditionExpression: 'pk = :no AND tstamp <= :st',
//       FilterExpression: "(#transactionDate >= :lastMonth)",
//       // KeyConditionExpression: '#transactionDate >= :lastMonth',
//       ExpressionAttributeNames: {
//         '#transactionDate': 'transactionDate'
//       },
//       ExpressionAttributeValues: {
//         ':lastMonth': convertedDate,
//         ':no' : "1",
//         ':st' : Number(Date.now())
//       }
//     };
//     console.log("params : ",params);
//     const result = await dynamoDB.query(params).promise();

//     return {
//       statusCode: 200,
//       body: result
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message })
//     };
//   }
// };


const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    
    console.log('Event Body : ',event);
    
    const currentDate = new Date();

    let startDate;

    switch (event['timeRange'].toLowerCase()) { 
      case 'lastmonth':
        const lastMonth = new Date(currentDate);
        lastMonth.setMonth(currentDate.getMonth() - 1);
        startDate = lastMonth;
        break;
      case 'last3months':
        const last3Months = new Date(currentDate);
        last3Months.setMonth(currentDate.getMonth() - 3);
        startDate = last3Months;
        break;
      case 'last6months':
        const last6Months = new Date(currentDate);
        last6Months.setMonth(currentDate.getMonth() - 6);
        startDate = last6Months;
        break;
      case 'lastyear':
        const lastYear = new Date(currentDate);
        lastYear.setFullYear(currentDate.getFullYear() - 1);
        startDate = lastYear;
        break;
      default:
      console.log("range : ",event['timeRange'].toLowerCase());
        return {
          statusCode: 400,
          body: 'Invalid time range. Please provide lastMonth, last3Months, last6Months, or lastYear.'
        };
    }
    console.log("Start Date : ",startDate);
    let timeStamp = startDate.getTime();
    console.log("Time stamp : ",timeStamp);
    const convertedDate = convertDateFormat(startDate);
    console.log("Converted date : ",convertedDate);

    
    const params = {
      TableName: 'sanford_accounting',
      IndexName: 'pk-tstamp-index',
      KeyConditionExpression: '#pk = :no AND #tstamp >= :st',
      // FilterExpression: "(#transactionDate >=  :val4)",
      ExpressionAttributeNames: {
        '#tstamp': 'tstamp',
        '#pk' : 'pk'
      },
      ExpressionAttributeValues: {
        // ':val4': '05/10/2023',
        ':no' : "1", 
        ':st' : timeStamp
      }
    };
    console.log("Params : ",params);
    const result = await dynamoDB.query(params).promise();
    console.log("Length of Items : ",result['Items'].length);
    if(result['Items'] == undefined || result['Items'].length == 0){
      return{
        statusCode : 200,
        body : {
          Items:[]
        }
      };
    }
    else{ 
      return {
        statusCode: 200,
        body: result
      };
    }
    
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
};

function convertDateFormat(inputDate) {
  const dateObject = new Date(inputDate);
  const day = dateObject.getUTCDate();
  const month = dateObject.getUTCMonth() + 1; // Months are zero-based
  const year = dateObject.getUTCFullYear();

  // Pad single-digit day or month with leading zero
  const formattedDay = day < 10 ? '0' + day : '' + day;
  const formattedMonth = month < 10 ? '0' + month : '' + month;

  return formattedDay + '/' + formattedMonth + '/' + year;
}
