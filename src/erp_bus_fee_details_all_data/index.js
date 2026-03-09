
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const scanParams = {
      TableName: 'erp_bus_fee'
    };
    const result = await dynamodb.scan(scanParams).promise();
    
     // Process the data to group it by class
    // let busFee = {};
    // result.Items.forEach((item) => {
    //   console.log("item : ",item);
    //   const range = item.range; // Assuming your table has a 'class' attribute
    //   console.log('Class id : ',range);
    //   if (!busFee[range]) {
    //     busFee[range] = [];
    //   }
    //   busFee[range].push(item);
    //   console.log(busFee);
    // });


    return {
      statusCode: 200,
      body: result
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
};