const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Validate required fields
    if (!event['standard'] || !event['section'] || !event['month']) {
      return {
        statusCode: 400,
        body: 'Invalid request. Standard, Section, and Month are required.',
      };
    }

    console.log("Event Body : ", event);

    // Get students from the students table based on class and section
    const studentsQueryParams = {
      TableName: 'erp_students',
      FilterExpression: '#standard = :standard AND #section = :section',
      ExpressionAttributeNames: {
        '#standard': 'standard',
        '#section': 'section'
      },
      ExpressionAttributeValues: {
        ':standard': event['standard'],
        ':section': event['section'],
      },
    };
    console.log("Students Params : ", studentsQueryParams);

    const studentsQueryResult = await dynamoDB.scan(studentsQueryParams).promise();
    const students = studentsQueryResult.Items;

    // Loop through each student and check fee payment status
    const unpaidStudents = [];

    // Fetch fee details
    let feeParams = {
      TableName: 'erp_students_fee',
      Key: {
        id: `${event['standard']}_${event['academic_year']}`
      }
    };

    let fee = await dynamoDB.get(feeParams).promise();
    console.log("Fee : ", fee);

    if (!fee['Item']) {
      return {
        statusCode: 400,
        body: `Class ${event['standard']} fee details are not available`,
      };
    }

    let total = 0;
    console.log("****Month fee : ", fee['Item'][event['month']]);

    for (let i = 0; i < fee['Item'][event['month']].length; i++) {
      total += Number(fee['Item'][event['month']][i].amount);
    }

    console.log("Total : ", total);

    // Check fee payment status for each student
    for (const student of students) {
      const admissionNumber = student['admission_no'];

      // Fetch fee details for the student for the specified month
      const feeQueryParams = {
        TableName: "erp_fee_details",
        Key: {
          id: `${admissionNumber}_${student['academic_year']}`,
        },
        ProjectionExpression: `#month`,
        ExpressionAttributeNames: {
          '#month': event['month'], 
        },
      };
      console.log("Fee Query Params: ", feeQueryParams);
 
      const feeQueryResult = await dynamoDB.get(feeQueryParams).promise();
      console.log("Fee Result : ", feeQueryResult);

      let feeAmount = feeQueryResult['Item'][event['month']]['remainingAmount'] || 0;
      console.log("Fee Amount : ", feeAmount);
      console.log(feeAmount == undefined);
      if (feeAmount == 0) {
        feeAmount = total;
        console.log("Fee Amount : ", feeAmount);
      } 
      // else {
      //   feeAmount = (feeAmount == 0.00) ? total : feeAmount;
      //   console.log("Fee Amount : ", feeAmount);
      // }

      if (!feeQueryResult['Item'][event['month']]['paid']) {
        // Fee is not paid for the event['month']
        unpaidStudents.push({
          admissionNumber,
          name: student['name'],
          fatherName: student['father_name'],
          standard: event['standard'],
          section: event['section'],
          month: event['month'],
          feeAmount: feeAmount
        });
      }
    }

    console.log("Unpaid students : ", unpaidStudents);

    return {
      statusCode: 200,
      body: unpaidStudents,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};



// const AWS = require('aws-sdk');

// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const studentsTableName = 'StudentsTable'; // Replace with your actual students table name
// const feeTableName = 'FeeTable'; // Replace with your actual fee table name

// exports.handler = async (event) => {
//   try {
    
//     console.log("Event Body : ",event);
//     // Validate required fields
//     if (!event['standard'] || !event['section'] || !event['month']) {
//       return {
//         statusCode: 400,
//         body: 'Invalid request. Standard, Section and Month are required.',
//       };
//     }

//     // Get students from the students table based on class and event['section']
//     const studentsQueryParams = {
//     TableName: 'erp_students',
//     FilterExpression: '#standard = :standard AND #section = :section',
//     ExpressionAttributeNames: {
//       '#standard' : 'standard',
//       '#section' : 'section'
//     },
//     ExpressionAttributeValues: {
//       ':standard': event['standard'],
//       ':section': event['section'],
//     },
    
//   };
//   console.log("Students Parms : ",studentsQueryParams)

//     const studentsQueryResult = await dynamoDB.scan(studentsQueryParams).promise();
//     const students = studentsQueryResult.Items; 
//     // console.log("Students : ",students)

//     // Loop through each student and check fee payment status
//     const unpaidStudents = [];
    
//     let feeparams = {
//       TableName : 'erp_students_fee',
//       Key : {
//         id : event['standard'] + "_" + event['academic_year']
//       }
//     };
    
//     let fee = await dynamoDB.get(feeparams).promise();
//     console.log("Fee : ",fee);
    
//     if(fee['Item'] == undefined){
//       return {
//         statusCode : 400,
//         body : `Class ${event['standard']} fee details is not available`,
//       };
//     }
//     let total = 0; 
//     console.log("Month fee : ",fee['Item'][event['month']]);
    
//     for (let i = 0; i < fee['Item'][event['month']].length; i++) {
//         total += Number(fee['Item'][event['month']][i].amount);
//     }
    
//     console.log("Total : ",total);
    
//     for (const student of students) {
//       const admissionNumber = student['admission_no'];

//       // Check if fee is not paid for the specified event['month']
//       const feeQueryParams = {
//         TableName: "erp_fee_details",
//         Key: {
//           id: admissionNumber + "_" + event['academic_year'],
//         },
//         ProjectionExpression: `#month`,
//         ExpressionAttributeNames: {
//             '#month': event['month'],
//         },
//       };
//       console.log("feeQueryParams : ",feeQueryParams);
//       const feeQueryResult = await dynamoDB.get(feeQueryParams).promise();
//       console.log("Fee Result : ",feeQueryResult);
      
      
//       let feeAmount = feeQueryResult['Item'][event['month']]['remainingAmount'];
//       console.log("Fee Amount : ",feeAmount);
//       console.log(feeAmount == undefined);
//       if(feeAmount == undefined){
//         feeAmount = total;
//         console.log("Fee Amount : ",feeAmount);
        
//       }else{
//         feeAmount = (feeAmount == 0.00 ) ? total : feeAmount;
//         console.log("Fee Amount : ",feeAmount);
        
//       }
      
      
//       if (!feeQueryResult['Item'][event['month']]['paid']) {
//         // Fee is not paid for the event['month']
//         unpaidStudents.push({
//           admissionNumber,
//           name : student['name'],
//           fatheName : student['father_name'],
//           standard: event['standard'],
//           section: event['section'],
//           month : event['month'],
//           feeAmount : feeAmount
//         });
//       }
//     }
//     console.log("Unpaid students : ",unpaidStudents);
//     return {
//       statusCode: 200,
//       body: unpaidStudents,
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message }),
//     };
//   }
// };