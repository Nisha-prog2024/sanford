const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        console.log("Event Body : ",event);
        if(event['standard'] == "" || event['standard'] == undefined || event['academic_year'] == "" || event['academic_year'] == undefined){
            return{
                statusCode : 400,
                body : "standard and academic yearis Required"
            };
        }
        if(Array.isArray(event['fee_details']) == false){
           return{
                statusCode : 400, 
                body : "Fee Details should be in array"
            }; 
        }
        
        if(event['fee_details'][0].fee_type == undefined || event['fee_details'][0].fee_type == ""  || event['fee_details'][0].amount == undefined || event['fee_details'][0].amount == ""){
            return{
                statusCode: 400,
                body : "Fee Type and Amount is required in Fee Details" 
            };
        }
        
        let params = {
            TableName: "erp_students_fee",
            Item: {
                'id' : event['standard'].toLowerCase() + "_" + event['academic_year'],
                'standard' : event['standard'].toLowerCase(),
                'academic_year': event['academic_year'],
                "january" : event['fee_details'],
                "february" : event['fee_details'],
                "march" : event['fee_details'],
                "april" : event['fee_details'],
                "may" : event['fee_details'],
                "june" : event['fee_details'],
                "july" : event['fee_details'],
                "august" : event['fee_details'],
                "september" : event['fee_details'],
                "october" : event['fee_details'],
                "november" : event['fee_details'],
                "december" : event['fee_details']
            }
        };
        
        console.log("Params : ",params);
        await dynamoDB.put(params).promise();
        
        return {
            statusCode : 200,
            body : "Fee Updated Successfully"
        };
        
    }
    catch(e){
        return {
            statusCode: 500,
            body : e.message
        };
    }
};
   


















// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event) => {
    
//     try {
      
//       console.log("Params : ",event);
//         // Fetch existing compulsory fees for the specified class
//         const existingCompulsoryFeesParams = {
//             TableName: 'erp_students_fee',
//             Key: {
//                 'standard' : event['standard'],
//             },
//         };

//         const existingCompulsoryFeesResult = await dynamoDB.get(existingCompulsoryFeesParams).promise();
//         const existingCompulsoryFees = existingCompulsoryFeesResult.Item;

//         // Update or create new compulsory fees record
//         const updatedCompulsoryFeesParams = {
//             TableName: 'erp_students_fee',
//             Item: {
//                 'standard' : event['standard'],
//                 tutionFee: event['tutionFee'] || (existingCompulsoryFees ? existingCompulsoryFees.tutionFee : 0),
//                 computerFee: event['computerFee'] || (existingCompulsoryFees ? existingCompulsoryFees.computerFee : 0),
//                 libraryFee: event['libraryFee'] || (existingCompulsoryFees ? existingCompulsoryFees.libraryFee : 0),
//             },
//         };
//         console.log("updatedCompulsoryFeesParams : ",updatedCompulsoryFeesParams);
//         await dynamoDB.put(updatedCompulsoryFeesParams).promise();

//         return {
//             statusCode: 200,
//             body:'Compulsory fees updated successfully' ,
//         };
//     } catch (error) {
//         return {
//             statusCode: 500,
//             body: error.message,
//         };
//     }
// };








// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event, context) => {
//   try {
   
//   console.log("Event body : ",event); 
//   if(event['standard'] == "" || event['standard'] == undefined){
//     return {
//       statusCode : 400,
//       body : "Standard is required"
//     };
//   }
  
//   event['annual_fee'] = ( event['annual_fee'] == "" || event['annual_fee'] == undefined) ? "0" : event['annual_fee'];
//   console.log("Anual Fee : ",event['annual_fee']);
  
//   event['tution_fee'] = ( event['tution_fee'] == "" || event['tution_fee'] == undefined) ? "0" : event['tution_fee'];
//   console.log("Tution Fee : ",event['tution_fee']);
  
//   event['computer_fee'] = ( event['computer_fee'] == "" || event['computer_fee'] == undefined) ? "0" : event['computer_fee'];
//   console.log("Computer Fee : ",event['computer_fee']);
  
  
//   const params = {
//     TableName: 'erp_students_fee', 
//     Key: {
//       'standard' : event['standard']
//     },
//     UpdateExpression : 'SET #annual_fee = :annual_fee, #tution_fee = :tution_fee, #computer_fee = :computer_fee',
//     ExpressionAttributeNames: {
//       '#annual_fee' : 'annual_fee',
//       '#tution_fee' : 'tution_fee',
//       '#computer_fee' : 'computer_fee',
//     },
//     ExpressionAttributeValues: {
//       ':annual_fee': event['annual_fee'],
//       ':tution_fee': event['tution_fee'],
//       ':computer_fee' : event['computer_fee'],
//     },
//   };
//     console.log("Params : ",params);
//     await dynamoDB.update(params).promise();

//     return {
//       statusCode: 200,
//       body: "Fee updated Successfully"
//     };
//   } 
//   catch (error) {
    
//     return {
//       statusCode: 500,
//       body: error.message
//     };
//   }
// };