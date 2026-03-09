var AWS = require('aws-sdk');
var nodemailer = require('nodemailer');
var dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        console.log(event);
        if (event['phone'] == "" || event['phone'] == undefined || event['name'] == "" || event['name'] == undefined || event['email'] == "" || event['email'] == undefined) {
            return {
                statusCode: 500,
                body: "Name/Phone/Email is required"
            };
        }
        var time = new Date();
        var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        var timeList = dateTime.split(',');
        var time1 = timeList[1].trim();
        var date = timeList[0].trim();
        const auto = "enq" + await auto_num();
        console.log(auto);

        var params = {
            TableName: 'dav_sanford_admission_enquiry',
            Item: {
                "enqid": auto,
                "name": event['name'],
                "email": event['email'],
                "phone": event['phone'],
                "gender": event['gender'],
                "academic_year": event['academic_year'],
                "standard": event['standard'],
                "current_school": event['current_school'],
                "Date": date,
                "time": time1,
                "pk": "1",
                "tstamp": Number(Date.now())
            }
        };
        console.log(params);
        await dynamodb.put(params).promise();

        var email = await mail(event, auto);
        console.log("admin mail : ", email);

        var user_email = await user_mail(event);
        console.log("USER EMAIL : ", user_email);

        return {
            statusCode: 200,
            body: {
                "message": "Admission Enquiry is created",
                "enqid": auto
            }
        };

    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};

async function auto_num() {
    try {
        const auto_num = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        return auto_num;
    } catch (e) {
        return e.message;
    }
}

async function mail(event, id) {
    try {
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
        
        // Compose HTML email content
        const htmlContent = `
            <html>
            <head>
                <title>Admission Enquiry</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f7f7f7;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }
                    h1, h2, h3, h4 {
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
                    <h1>New Admission Enquiry</h1>
                    <p><strong>Name:</strong> ${event['name']}</p>
                    <p><strong>Email:</strong> ${event['email']}</p>
                    <p><strong>Phone:</strong> ${event['phone']}</p>
                    <p><strong>Gender:</strong> ${event['gender']}</p>
                    <p><strong>Academic Year:</strong> ${event['academic_year']}</p>
                    <p><strong>Standard:</strong> ${event['standard']}</p>
                    <p><strong>Current School:</strong> ${event['current_school']}</p>
                    <br/>
                    <p>Request ID: ${id}</p>
                </div>
            </body>
            </html>
        `;
        
        // Configure Nodemailer
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'davsanford777@gmail.com',
                pass: 'bcpneroghcslyzdt'
            }
        });
        
        // Email options
        var mailOptions = {
            from: 'Sanford Admin <davsanford777@gmail.com>',
            to: emails.join(', '), // Convert array to comma-separated string
            subject: 'New Admission Enquiry - D.A.V Sanford Public School',
            html: htmlContent
        };
        
        console.log("ADMIN MAILS : ",mailOptions);
        
        // Send email
        const res = await transporter.sendMail(mailOptions);
        
        // Return response
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

async function user_mail(event) {
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'davsanford777@gmail.com',
                pass: 'bcpneroghcslyzdt'
            }
        });
        //   console.log(transporter);
        var mailOptions = {
            from: 'davsanford777@gmail.com',
            to: event['email'],
            subject: 'Admission Enquiry Response',
            // html: "<h3>Hello " + event['name'] + "</h3><br/><p>We received your enquiry and will get back to you with a response as soon as possible. We will contact you during working hours 9 A.M to 4 P.M. Thanks for contacting us. </p><br/><h3 style='color:red'>This is auto generated mail. Please don't reply on this email.</h3><br/><h2>Thanks<h2><h1>D.A.V Sanford public <h1>"
            html: `<!DOCTYPE html>
<html>
<head>
  <title>Admission Enquiry Response</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Admission Inquiry Response</h2>
    <p>Dear ${event['name']},</p>
    <p>Thank you for your interest in D.A.V Sanford Public School. We appreciate your inquiry regarding admission.</p>
    
    <p>We are pleased to inform you that your enquiry has been received and is currently under review. Our admission team will carefully assess your enquiry and get back to you with further details.</p>
    
    <p>If you have any questions or require additional information, please feel free to contact our admission office at 8757-327-770 or davsanford777@gmail.com.</p>
    
    <p>Thank you for considering D.A.V Sanford Public School for your educational journey. We look forward to the possibility of welcoming you as a part of our school community.</p>
    
    <p>Best regards,</p>
    <p>D.A.V Sanford Public School</p>
    <p>Contact:  8757-327-770 or davsanford777@gmail.com.</p>
  </div>
</body>
</html>`
        };
        console.log("Mail option : ", mailOptions);

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

        console.log("response : ", res);
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


