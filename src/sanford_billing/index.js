const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    const bucketName = 'web-dav-sanford';

    try {
        const objectList = await s3.listObjectsV2({ Bucket: bucketName }).promise();

        const monthlySizes = {};

        objectList.Contents.forEach(object => {
            const month = object.LastModified.getMonth() + 1; // Adding 1 since months are zero-indexed
            const year = object.LastModified.getFullYear();
            const key = `${year}-${month}`;
            
            if (!monthlySizes[key]) { 
                monthlySizes[key] = 0;
            }

            monthlySizes[key] += object.Size;
        });
        
        let totalSize = 0;
        
        // Store sizes in DynamoDB
        for (const key in monthlySizes) {
            
            const [year, month] = key.split('-');
            let size = monthlySizes[key];
            let sizeInBytes = size;
            let price;
            if (size >= 1125899906842624) {
                size = (size / 1024 * 1024 * 1024 * 1024 * 1024).toFixed(2);
                price = (5242880*size);
                size = size + " PB";
            }
            else if (size >= 1099511627776) {
                size = (size / 1024 * 1024 * 1024 * 1024).toFixed(2);
                price = (5120 * size);
                size = size + " TB";
            }
            else if (size >= 1073741824) {
                size = (size / (1024 * 1024 * 1024)).toFixed(2);
                price = (5*size);
                size = size + " GB";
            }
            else if (size >= 1048576) {
                size = (size / (1024 * 1024)).toFixed(2);
                price = 5;
                size = size + " MB";
            }
            else if (size >= 1024) {
                size = (size / (1024)).toFixed(2);
                price = 5;
                size = size + " KB";
            }
            else {
                price = 5;
                size = size + " BYTE";
            }

            console.log(size);

            let params = {
                TableName: 'dav_sanford_billing',
                Key: {
                    id: parseInt(month) + "-" + parseInt(year)
                }
            }
            console.log(params);

            let temp2 = await dynamodb.get(params).promise();
            console.log("********** : ",temp2);
            console.log(sizeInBytes)
            
            // console.log(temp2['Item']['sizeInBytes'] < sizeInBytes)
            if(temp2['Item'] == undefined){
                await update(month,year,size,sizeInBytes,price);
            }
            else if(temp2['Item']['sizeInBytes'] < sizeInBytes){
                await update(month,year,size,sizeInBytes,price);
            }
            
            totalSize += sizeInBytes;
        }
        
        let temp = totalSize;
        let price;
        if (totalSize >= 1125899906842624) {
                totalSize = (totalSize / 1024 * 1024 * 1024 * 1024 * 1024).toFixed(2);
                price = (5242880*totalSize);
                totalSize = totalSize + " PB";
            }
            else if (totalSize >= 1099511627776) {
                totalSize = (totalSize / 1024 * 1024 * 1024 * 1024).toFixed(2);
                price = (5120 * totalSize);
                totalSize = totalSize + " TB";
            }
            else if (totalSize >= 1073741824) {
                totalSize = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
                price = (5 * totalSize);
                totalSize = totalSize + " GB";
            }
            else if (totalSize >= 1048576) {
                totalSize = (totalSize / (1024 * 1024)).toFixed(2);
                price = 5;
                totalSize = totalSize + " MB";
            }
            else if (totalSize >= 1024) {
                price = 5;
                totalSize = (totalSize / (1024)).toFixed(2);
                totalSize = totalSize + " KB";
            }
            else {
                price =5;
                totalSize = totalSize + " BYTE";
            }
            
            console.log(totalSize);

        
        let getParams = {
            TableName : 'dav_sanford_billing',
            Key : {
                'id' : "id54325189",
            }
        };
        
        let temp1 = await dynamodb.get(getParams).promise();
        let updateParams;
        if(temp1['Item'] == undefined){
         updateParams = {
          TableName : 'dav_sanford_billing',
          Key: {
              'id' : "id54325189"
          },
          UpdateExpression : 'SET #size = :size, #sizeInBytes = :sizeInBytes, #price = :price',
          ExpressionAttributeNames: {
              '#size' : 'size',
              '#sizeInBytes' : 'sizeInBytes',
              '#price' : 'price'
          },
          ExpressionAttributeValues: {
              ':size': totalSize,
              ':sizeInBytes' : temp,
              ':price' : price
          },
        };
        
        }
        else if(temp1['Item']['sizeInBytes'] <= temp ){
         updateParams = {
          TableName : 'dav_sanford_billing',
          Key: {
              'id' : "id54325189"
          },
          UpdateExpression : 'SET #size = :size, #sizeInBytes = :sizeInBytes, #price = :price',
          ExpressionAttributeNames: {
              '#size' : 'size',
              '#sizeInBytes' : 'sizeInBytes',
              '#price' : 'price'
          },
          ExpressionAttributeValues: {
              ':size': totalSize,
              ':sizeInBytes' : temp,
              ':price' : price
          },
        };
        
        }
        console.log(updateParams);
        await dynamodb.update(updateParams).promise();
        return {
            statusCode: 200,
            body: monthlySizes
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: error.messa
        };
    }
};

async function update(month,year,size,sizeInBytes,price){
    let params = {
        TableName: 'dav_sanford_billing',
        Item: {
            id: parseInt(month) + "-" + parseInt(year),
            year: parseInt(year),
            month: parseInt(month),
            size: size,
            sizeInBytes : sizeInBytes,
            price : price
        }
    };
    console.log(params);

    await dynamodb.put(params).promise();
}

