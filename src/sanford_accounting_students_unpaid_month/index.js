const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {

    // Validate required field
    if (!event['admissionNumber'] || !event['academicYear']) {
      return {
        statusCode: 400,
        body: 'Invalid request. Admission number and academic year are required.',
      };
    }
    
    const studentQueryParams = {
      TableName: "erp_students", 
      Key: {
        admission_no : event['admissionNumber'],
      },
    };

    const studentQueryResult = await dynamoDB.get(studentQueryParams).promise();
    console.log("Student Query Result : ",studentQueryResult);
    

    if (studentQueryResult['Item'] == undefined) {
      return {
        statusCode: 400,
        body: 'Invalid admission number. Please provide a valid admission number.',
      };
    }


    const queryParams = {
      TableName: "erp_fee_details",
      Key: {
        id : event['admissionNumber'] + "_" + event['academicYear'],
      },
    };

    const queryResult = await dynamoDB.get(queryParams).promise();
    const studentFeeData = queryResult.Item || {};

     const unpaidMonths = Object.keys(studentFeeData)
      .filter((month) => studentFeeData[month].paid !== true)
      .filter(month => /^[a-zA-Z]+$/.test(month)) // Filter out non-month properties
      .sort((a, b) => {
        const monthsOrder = [
          "april", "may", "june", "july", "august", "september",
          "october", "november", "december", "january", "february", "march"
        ];
        return monthsOrder.indexOf(a.toLowerCase()) - monthsOrder.indexOf(b.toLowerCase());
      });
      
      let stringsToRemove = ["id", "pk", "name", "academic_year", "admission_no", "standard"]; 

    stringsToRemove.forEach(string => {
      let index = unpaidMonths.indexOf(string);
      while (index !== -1) {
        unpaidMonths.splice(index, 1);
        index = unpaidMonths.indexOf(string);
      }
    });

    console.log("Unpaid months: ", unpaidMonths);
      
    return {
      statusCode :  200,
      admissionNumber: event['admissionNumber'],
      academicYear: event['academicYear'],
      unpaidMonths: unpaidMonths,
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: error.message ,
    };
  }
};