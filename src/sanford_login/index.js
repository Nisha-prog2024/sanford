let AWS = require('aws-sdk');
let dynamoDb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var time = new Date();
var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });

exports.handler = async (event) => {
  try {
    console.log(event);
    const params = {
      TableName: "dav_sanford",
      Key: {
        'id': event['id']
      }
    };
    let check = await dynamoDb.get(params).promise();
    console.log(check['Item']); 

    if (check['Item'] == undefined) {
      return {
        statusCode: 400,
        body: "Wrong Email Id"
      };
    }

    console.log(event['password']);
    console.log(check['Item']['password']);
    
    if (bcrypt.compareSync(event['password'], check['Item']['password'])) {
      var secretKey = "$#&^*6e$2%$&%#";
      var payload = {
        name: check['Item']['name'],
        id: check['Item']['id'],
        role: check['Item']['role'],
      };
    }
    else {
      return {
        statusCode: 400,
        body: "Invalid credentials"
      };
    }
    
    const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });
    console.log(token);
    return {
      statusCode: 200,
      body: {
        message: "Login success",
        tokens: token
      },
    };

  }
  catch (e) {
    return {
      statusCode: 500,
      body: e.message
    
    }
    }
}
