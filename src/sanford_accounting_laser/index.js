const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    
    console.log("Event : ",event);
    const creditData = await getItemsByType('credit');
    const debitData = await getItemsByType('debit');
    
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
const getItemsByType = async (type) => {
  const params = {
    TableName: 'sanford_accounting',
    FilterExpression: `${type} <> :val`,
    ExpressionAttributeValues: {
      ':val' : '0.00'
    },
  };
  console.log("params : ",params);
  const result = await dynamoDB.scan(params).promise();
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