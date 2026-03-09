var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var nodemailer = require('nodemailer');
var dynamodb = new AWS.DynamoDB.DocumentClient();

var bucket = "web-dav-sanford";

// Lambda function entry point
exports.handler = async (event) => {
    try {
        // Check if PDF data is provided
        if (event['pdf'] == undefined || event['pdf'] == "") {
            return {
                statusCode: 404,
                body: "resume not found"
            };
        }

        // Get current date and time
        var time = new Date();
        var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        var timeList = dateTime.split(',');
        var time1 = timeList[1].trim();
        var date = timeList[0].trim();

        // Generate unique ID
        const auto = "req" + await auto_num();
        console.log(auto);

        // Upload PDF to S3
        var pdf = await upload(event, auto);

        // Save data to DynamoDB
        var params = {
            TableName: 'dav_sanford_carrier',
            Item: {
                "id": auto,
                "name": event['name'],
                "email": event['email'],
                "phone": event['phone'],
                "apply": event['apply'],
                "address": event['address'],
                "message": event['message'],
                "years_of_experience": event['years_of_experience'],
                "link": pdf,
                "Date": date,
                "time": time1,
                "pk": "1",
                "tstamp": Number(Date.now())
            }
        };
        console.log(params);
        await dynamodb.put(params).promise();
        
        // Return success response
        return {
            statusCode: 200,
            body: {
                "message": "Resume is uploaded"
            }
        };

    } catch (e) {
        // Return error response
        return {
            statusCode: 500,
            body: e.message
        };
    }
};

// Generate a random number for ID
async function auto_num() {
    try {
        const auto_num = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        return auto_num;
    } catch (e) {
        return e.message;
    }
}

// Upload PDF to S3
async function upload(event, id) {
    try {
        var base64RemoveDataURI = new Buffer.from(event['pdf']['base64'].replace("data:application/pdf;base64,", "").replace("data:application/doc;base64,", "").replace("data:application/docx;base64,", ""), 'base64');
        var bucketParams = {
            Key: "resume/" + event['pdf']['name'],
            Body: base64RemoveDataURI,
            Bucket: bucket,
            ContentType: 'application/pdf'
        };
        const link = await s3.upload(bucketParams).promise();
        
        // Send email notification
        var send = await mail(event, id);
        console.log(send);
        var sendmail = await user_mail(event);
        console.log(sendmail);

        return link['Location'];
    } catch (e) {
        return e.message;
    }
}

// Send notification email to admin
async function mail(event, id) {
    try {
        const base64RemoveDataURI = event['pdf']['base64'].replace(
            "data:application/pdf;base64,",
            ""
        ).replace(
            "data:application/doc;base64,",
            ""
        ).replace(
            "data:application/docx;base64,",
            ""
        );
        
        // Fetch admin emails from DynamoDB 
        var ad = {
            TableName: 'erp_user',
            FilterExpression: "(begins_with(#role,:val1))",
            ExpressionAttributeNames: {
                "#role": "role"
            },
            ExpressionAttributeValues: {
                ":val1": "admin"
            }
        };
        var admins = await dynamodb.scan(ad).promise();
        let emails = admins['Items'].map(item => item.email);

        // Create nodemailer transporter
        var transporter = nodemailer.createTransport({ 
            service: 'gmail',
            auth: {
                user: 'davsanford777@gmail.com',
                pass: 'tlmqmupwtsxomooy'
            }
        });

        // HTML email template
        var mailOptions = {
            from: 'Sanford Admin <davsanford777@gmail.com>',
            to: emails,
            subject: 'D.A.V Sanford Public School - New Job Application Received',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Job Application Received</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            padding: 20px;
                            background-color: #fff;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        h1 {
                            color: #333;
                        }
                        p {
                            color: #555;
                            line-height: 1.6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>New Job Application Received</h1>
                        <p>A new job application has been received. Below are the details:</p>
                        <ul>
                            <li><strong>Name:</strong> ${event['name']}</li>
                            <li><strong>Email:</strong> ${event['email']}</li>
                            <li><strong>Position Applied:</strong> ${event['apply']}</li>
                            <li><strong>Phone:</strong> ${event['phone']}</li>
                            <li><strong>Address:</strong> ${event['address']}</li>
                            <li><strong>Years of Experience:</strong> ${event['years_of_experience']}</li>
                            <li><strong>Message:</strong> ${event['message']}</li>
                        </ul>
                        <p>Please find the attached resume for review.</p>
                    </div>
                </body>
                </html>
            `, 
            attachments: [
                {
                    filename: event['pdf']['name'],
                    content: base64RemoveDataURI,
                    encoding: "base64",
                },
            ]
        };

        // Send email
        const res = await new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    resolve(info.response);
                }
            });
        });

        // Return response
        return {
            statusCode: 200,
            body: {
                input: res
            } 
        };
    } catch (e) {
        console.log("Error Message : ", e.message);
        return {
            statusCode: 500,
            body: e.message
        };
    }
}

// Send confirmation email to the applicant
async function user_mail(event) {
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'davsanford777@gmail.com',
                pass: 'tlmqmupwtsxomooy'
            }
        });

        var mailOptions = {
            from: 'davsanford777@gmail.com',
            to: event['email'],
            subject: 'Thank You for Your Job Application - D.A.V Sanford Public School',
            html: `<!DOCTYPE html>
<html>
<head>
    <title>Job Application Received</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 20px auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
        }
        p {
            color: #555555;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Job Application Received</h1>
        <h2>Thank you for applying to D.A.V Sanford Public School!</h2>
        <p>Your application has been received. We appreciate your interest in joining our team.</p>
        <p>We will review your application carefully and get in touch with you soon regarding the next steps.</p>
        <br>
        <p>Best regards,<br>D.A.V Sanford Public School Recruitment Team</p>
    </div>
</body>
</html>`
        };

        const res = await new Promise((rsv, rjt) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return rjt(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    return rsv(info.response);
                }

            });
        });
        return {
            statusCode: 200,
            body: {
                input: res
            }
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
}
