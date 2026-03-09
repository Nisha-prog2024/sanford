var aws = require('aws-sdk');
var dynamodb = new aws.DynamoDB.DocumentClient();
var s3 = new aws.S3();

exports.handler = async (event) => {
    try {
        console.log(event);

        if (event['id'] == undefined || event['id'] == "") {
            return {
                statusCode: 404,
                body: "Id is required"
            };
        }

        let Dparams = {
            TableName: "dav_sanford_news",
            Key: {
                "id": event['id'],
            }
        };
        console.log(Dparams);
        let data = await dynamodb.get(Dparams).promise();
        console.log(data);
  
        if (data['Item'] == undefined) {
            return {
                statusCode: 404,
                body: "Id not found"
            };
        }

        let file_name = data['Item']['imageUrl'].split('/')[3] + "/" + data['Item']['imageUrl'].split('/')[4];
        console.log(file_name);
        file_name = decodeURI(file_name);

        const params = {
            Bucket: "web-dav-sanford",
            Key: file_name                              // 'some/subfolders/nameofthefile1.extension'
        };
        let ch = await s3.deleteObject(params).promise();
        console.log(ch);

        await dynamodb.delete(Dparams).promise();
        return {
            statusCode: 200,
            body: "News deleted"
        };


    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};
