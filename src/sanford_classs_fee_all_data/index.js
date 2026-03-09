
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const scanParams = {
      TableName: 'dav_sanford_fee_details',
      FilterExpression: '#type = :value',
      ExpressionAttributeNames: {
        '#type' : 'type'
      },
      ExpressionAttributeValues: {
        ':value': 'class fee',
      }
    };
    const result = await dynamodb.scan(scanParams).promise();
    
     // Process the data to group it by class
    let classData = {};
    result.Items.forEach((item) => {
      console.log("item : ",item)
      const classId = item.range; // Assuming your table has a 'class' attribute
      console.log('Class id : ',classId);
      if (!classData[classId]) {
        classData[classId] = [];
      }
      classData[classId].push(item);
      console.log(classData)
    });


    return {
      statusCode: 200,
      body: classData
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message
    };
  }
};