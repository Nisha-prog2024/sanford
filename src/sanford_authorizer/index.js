var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken'); 
 

let secretKey = "$#&^*6e$2%$&%#";
exports.handler = async function (event) {
    try {
        console.log(event);
        // const auth_token = event['authorizationToken'];
        const auth_token = event.headers.Authorization || event.headers.authorization;
        let verify=jwt.verify(auth_token,secretKey);
        console.log(verify);
        const decode_token = await jwt.decode(auth_token, secretKey);
        console.log(decode_token);
        // const username = decode_token['username'];
        const role = decode_token['role'];
        console.log(role+" "+event['methodArn']);
        var policy={};
        switch (role) {
            case "admin":
                   policy = generatePolicy('user', 'Allow', event.methodArn);
                console.log(policy);
                break;
            case "subadmin":
                 policy = generatePolicy('user', 'Allow', event.methodArn);
                console.log(policy);
                break;
            default:
                policy = generatePolicy('user', 'Deny', event.methodArn);

                console.log(policy);
                break;
        }
        return policy;
    } catch (e) {
        return e.message
    }
};

function generatePolicy(principalId, effect, resource) {
    try{
    const policyDocument = {
        Version: '2012-10-17',
        Statement: [
            { 
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource,
            },
        ],
    };

    const response = {
        principalId,
        policyDocument,
    };

    return response;
    }
    catch (e){
        return e.message
    }
}