const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
         console.log(event); 
      if(event['admission_no'] == "" || event['admission_no'] == undefined){
        return {
          statusCode : 400,
          body : "Invalid Request : Admission Number is required"
        };
      }
        // Fetch student profile
        const studentProfileParams = {
            TableName: 'erp_students', 
            Key: {
                admission_no : event['admission_no'],
            },
        };

        const studentProfile = await dynamoDB.get(studentProfileParams).promise();
        console.log("Students Profile : ",studentProfile);

        // Check if the admission number is valid and student profile exists
        if (studentProfile['Item'] == undefined) {
            return {
                statusCode: 400,
                body: 'Invalid Admission Number',
            };
        }
        
        // Get academic year from the student's profile
        const academicYear = studentProfile['Item']['academic_year'];

        // Subtract 1 from the admission year
        const previousAcademicYear = (parseInt(academicYear.split('-')[0]) - 1) + '-' + (parseInt(academicYear.split('-')[1]) - 1);
        console.log("Previous Academic Year : ",previousAcademicYear);
        
        
        let standard = studentProfile['Item']['standard'];

        // Adjust standard based on specified logic
        if (standard === 'u.k.g') {
            standard = 'l.k.g';
        } else if (standard === 'l.k.g') {
            standard = 'nursery';
        } else if (standard === 'nursery') {
            standard = 'nursery';
        } else if (parseInt(standard) >= 1 && parseInt(standard) <= 10) {
            standard = String(parseInt(standard) - 1);
        }

      let params={
          TableName:"erp_fee_details",
          Key:{
              "id":event['admission_no'] + "_" + previousAcademicYear
          }
      };
      console.log(params);
      let data=await dynamoDB.get(params).promise();
      // console.log(data);
      
      if(data['Item']==undefined){
          return{
              statusCode:404,
              body:"No fee record available"
          };
      }
      
      return{
          statusCode:200,
          academic_year : previousAcademicYear,
          standard : standard,
          body:data
      };
       

        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};































// const AWS = require('aws-sdk');
// const dynamodb = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event) => {
 
//     try{
//       console.log(event); 
//       if(event['admission_no'] == "" || event['academic_year'] == "" || event['admission_no'] == undefined || event['academic_year'] == undefined){
//         return {
//           statusCode : 400,
//           body : "Admission number/Academic Year is required"
//         };
//       }
      
//       let params={
//           TableName:"erp_fee_details",
//           Key:{
//               "id":event['admission_no'] + "_" + event['academic_year']
//           }
//       };
//       console.log(params);
//       let data=await dynamodb.get(params).promise();
//       console.log(data);
//       if(data['Item']==undefined){
//           return{
//               statusCode:404,
//               body:"No fee record available"
//           };
//       }
      
      
      
//       return{
//           statusCode:200,
//           body:data
//       };
//     }catch(e){
//         return{
//             statusCode:500,
//             body:e.message
//         };
//     }
// };
