const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    
    console.log("Event : ",event);
    
    if(event['year'] == "" || event['year'] == undefined){
      return{
        statusCode : 400,
        body : "Month's /Year Is Required"
      };
    }
    
    event['year'] = String(event['year'])
    const creditData = await getItemsByType('credit',event);
    const debitData = await getItemsByType('debit',event);
    
    console.log("Credit Data : ",creditData);
    console.log("Debit Data : ",debitData);

    // Calculate total credit and debit amounts
    const totalCredit = calculateTotalAmount(creditData,"credit");
    const totalDebit = calculateTotalAmount(debitData,"debit");
     
    console.log("Total Credit Data : ",totalCredit);
    console.log("Total Debit Data : ",totalDebit);

    // Calculate profit or loss
    const profit = (totalCredit - totalDebit) > 0 ? (totalCredit - totalDebit) : 0 ;
    const loss = (totalDebit - totalCredit) > 0 ? (totalDebit - totalCredit) : 0 ;

    return {
      statusCode: 200,
      body: {
        Total_credit : totalCredit.toFixed(2),
        Total_debit : totalDebit.toFixed(2),
        profit : profit.toFixed(2),
        loss : loss.toFixed(2)
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
 
// Function to retrieve items from DynamoDB based on type (credit/debit)
const getItemsByType = async (type,event) => {
 const  params = {
          TableName: 'sanford_accounting',
          IndexName: 'pk-tstamp-index',
          KeyConditionExpression: 'pk = :no AND tstamp <= :st',
          FilterExpression: "not begins_with(#paymentType,:val1) and #year1 = :val2",
          ExpressionAttributeNames: {
            '#paymentType': type,
            '#year1':'year'
          },
          ExpressionAttributeValues: {
            ':no': "1",
            ':st': Number(Date.now()),
            ':val1': '0.00',
            ':val2':event['year']
          },
          ScanIndexForward: false,
        };
  console.log("params : ",params);
  const result = await dynamoDB.query(params).promise();
  console.log("Credit / Debit Result : ",result);
  return result.Items || [];
};

// Function to calculate total amount from an array of items
const calculateTotalAmount = (items,type) => {
  let total = 0;
  
  for(const item of items){
    console.log(`${type} Amount : `,item[type]);
    total += Number(item[type]);
  }
  return total;
  
};