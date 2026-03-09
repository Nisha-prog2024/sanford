const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    console.log(event);
    let data;
    if((event['month'] != "" && event['month'] != undefined) && ( event['year'] != "" && event['year'] != undefined)){
      const params = {
          TableName: 'dav_sanford_billing',   
          FilterExpression: '#year = :yearValue AND #month = :monthValue',
          ExpressionAttributeNames: {
            '#year': 'year',
            '#month': 'month'
          },
          ExpressionAttributeValues: {
            ':yearValue': event['year'],
            ':monthValue':event['month']
          }
      };
      console.log(params);
      data = await dynamodb.scan(params).promise();
      console.log(data);
      console.log(data['Items'] != undefined);
      if (data['Items'] != undefined) {
      return {
        statusCode: 200,
        body: data
      };
     } else {
      return {
        statusCode: 404,
        body: 'No records found for the specified year and month'
      };
    }

    }
    else{
      console.log("under else block");
      const getParams = {
        TableName : "dav_sanford_billing",
        Key : {
          "id" : "id54325189"
        }
      }
      console.log(getParams);
      data = await dynamodb.get(getParams).promise();
      console.log(data);
      if (data['Item'] != undefined) {
      return {
        statusCode: 200,
        body: data
      };
    } else {
      return {
        statusCode: 404,
        body: 'No records found for the specified year and month'
      };
    }
    }
    
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: error.message
    };
  }
};