let AWS = require('aws-sdk');
let dynamoDb = new AWS.DynamoDB.DocumentClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
 
var time = new Date();
var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });

exports.handler = async (event) => {
    try {
        console.log("Event body : ",event);

        if (event['id'] == "" || event['id'] == undefined || event['password'] == "" || event['password'] == undefined) {
            return {
                statusCode: 404,
                body: "Id/Password is required"
            };
        }
        const params = {
            TableName: "erp_user",
            Key: {
                'id': event['id']
            }
        };
        let check = await dynamoDb.get(params).promise();
        console.log(check['Item']);

        if (check['Item'] == undefined) {
            return {
                statusCode: 400,
                body: "Invalid Id"
            };
        }

        console.log(event['password']);
        console.log(check['Item']['password']);

        if (check['Item']['isverified'] == "true") {
            switch (check['Item']['role'].toLowerCase()) {
                case 'admin':
                    if (bcrypt.compareSync(event['password'], check['Item']['password'])) {
                        var secretKey = "$#&^&e*&%#r";
                        var payload = {
                            name: check['Item']['name'],
                            id: check['Item']['id'],
                            role: check['Item']['role'],
                            gender: check['Item']['gender']
                        };
                    }
                    else {
                        return {
                            statusCode: 400,
                            body: "Invalid credentials"
                        };
                    }
                    break;
                case 'subadmin':
                    if (bcrypt.compareSync(event['password'], check['Item']['password'])) {
                        var secretKey = "$#&^&e*&%#r";
                        var payload = {
                            name: check['Item']['name'],
                            id: check['Item']['id'],
                            role: check['Item']['role'],
                            gender: check['Item']['gender']
                        };
                    }
                    else {
                        return {
                            statusCode: 400,
                            body: "Invalid credentials"
                        };
                    }
                    break;
                default:
                    return {
                        statusCode: 400,
                        body: "Invalid Role"
                    };
            }
        }
        else {
            return {
                statusCode: 400,
                body: "Not verified by admin"
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


// async function deviceToken() {
//   try {
//     const params = {
//       TableName: 'erp_user',
//       Key: {
//         'id': event['id']
//       },
//       UpdateExpression: 'SET #deviceToken = :deviceToken',
//       ExpressionAttributeNames: {
//         '#deviceToken': 'deviceToken'
//       },
//       ExpressionAttributeValues: {
//         ':deviceToken': event['deviceToken']
//       },
//     };

//     await dynamoDb.update(params).promise();

//   } catch (e) {
//     console.log(e.message);
//   }
// }