const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        console.log("event body : ", event);

        // Validate required fields
        if (!event['standard'] || !event['month'] || !event['admission_no'] || event['standard'] === "" || event['month'].length === 0 || event['admission_no'] === "") {
            return {
                statusCode: 400,
                body: "Invalid Request: Standard, Month (should be an array), and Admission Number are required."
            };
        }

        console.log("Is Array : ", Array.isArray(event['month']));
        if (!Array.isArray(event['month'])) {
            return {
                statusCode: 400,
                body: "Invalid Request: Month should be in an array."
            };
        }

        // Fetch student data
        let studentParams = {
            TableName: "erp_students",
            Key: {
                "admission_no": event['admission_no']
            }
        };
        let studentData = await dynamoDB.get(studentParams).promise();
        console.log("Student Data : ", studentData);

        if (studentData['Item'] === undefined) {
            return {
                statusCode: 404,
                body: "Invalid Admission Number"
            };
        }

        // Fetch the Fee
        let params = {
            TableName: "erp_students_fee",
            Key: {
                "id": event['standard'] + '_' + event['academic_year']
            }
        };
        let fee = await dynamoDB.get(params).promise();
        console.log("Fee : ", fee);

        if (fee['Item'] === undefined) {
            return {
                statusCode: 404,
                body: `Standard ${event['standard']}th Fee is not updated`
            };
        }

        // Fetch bus fee for the student
        const busFeeRangeParams = {
            TableName: 'erp_students_bus_fee_details',
            Key: {
                admission_no: event['admission_no'],
            },
        };
        const busFeeRangeResult = await dynamoDB.get(busFeeRangeParams).promise();
        console.log("Bus Fee Range Result : ", busFeeRangeResult);
        let busFeeAmount = 0;

        if (busFeeRangeResult['Item']) {
            let busFeeParams = {
                TableName: "erp_bus_fee",
                Key: {
                    id: busFeeRangeResult['Item']['range'] + "_" + event['academic_year']
                }
            };

            let busFeeResult = await dynamoDB.get(busFeeParams).promise();
            busFeeAmount = Number(busFeeResult['Item']['fee']) || 0;
        }

        let feeDetails = [];
        let netAmount = 0;

        // Iterate through each month
        for (let monthName of event['month']) {

            monthName = monthName.toLowerCase();

            let total = busFeeAmount;

            const monthData = fee['Item'][monthName];
            console.log("*******Month Data : ", monthData);

            if (monthData === undefined) {
                return {
                    statusCode: 404,
                    body: `${monthName} Month fee Details is not available`
                };
            }

            // Fetch additional details from fee_details_table
            const feeDetailsParams = {
                TableName: 'erp_fee_details',
                Key: {
                    id: event['admission_no'] + "_" + event['academic_year']
                }
            };

            const feeDetailsResult = await dynamoDB.get(feeDetailsParams).promise();

            // Check if fee details are available for the month
            if (feeDetailsResult['Item'] !== undefined && feeDetailsResult['Item'][monthName] !== undefined) {

                console.log("Fee details : ", feeDetailsResult);
                console.log("feeDetailsResult['Item'][monthName]['partialAmount'] : ", feeDetailsResult['Item'][monthName]['partialAmount']);


                var partialAmount = feeDetailsResult['Item'][monthName]['partialAmount'] || 0;
                var remainingAmount = feeDetailsResult['Item'][monthName]['remainingAmount'] || 0;
                var totalAmountPaid = feeDetailsResult['Item'][monthName]['total'] || 0;

                // Subtract the partial amount from the total

                console.log("Total : ", total);
                total -= partialAmount;
                console.log("Partial amount : ",partialAmount);
                console.log("Total : ", total);
            }
            
            let previouslyPaidFeeDetails = feeDetailsResult['Item'][monthName]['feeDetails'];
            console.log(`${monthName} previously Paid Fee Type fee details : `, previouslyPaidFeeDetails);
        
            if (previouslyPaidFeeDetails.length == 1 && previouslyPaidFeeDetails[0].amount === 0 && previouslyPaidFeeDetails[0].fee_type === '') {
                console.log("Fee is not paid.");
                        
                for (let i = 0; i < monthData.length; i++) {
                    console.log("Total : ",total);
                    total += Number(monthData[i].amount);
                }
                // console.log("*******Month Data : ", monthData);

                feeDetails.push({
                    month_name: monthName,
                    feeDetails: monthData,
                    busFee: busFeeAmount,
                    total: total,
                    partialAmount: partialAmount,
                });
            } else {
                
                console.log("*******Month Data : ", monthData);

                const mergeArrays = (arr1, arr2) => {
                    return arr1.map(item1 => {
                        const matchingItem = arr2.find(item2 => item1.fee_type === item2.fee_type);

                        if (matchingItem) {
                            // If fee_type exists in both arrays and amount is greater in arr2, replace it
                            if (matchingItem.amount > item1.amount) {
                                return matchingItem;
                            } else {
                                return item1;
                            }
                        } else {
                            // If fee_type is not in arr1, add it
                            return item1;
                        }
                    }).concat(arr2.filter(item2 => !arr1.some(item1 => item1.fee_type === item2.fee_type)));
                };

                let resultArray = mergeArrays(previouslyPaidFeeDetails, monthData);
                resultArray = resultArray.filter(item => item.fee_type.toLowerCase() !== 'bus fee');

                console.log("Result Array : ",resultArray);
 
                for (let i = 0; i < resultArray.length; i++) {
                    const fee = resultArray[i];
                    console.log("Total : ",total);
  
                    // Check if the fee_type is 'Concession Fee'
                    if (fee.fee_type.toLowerCase() !== 'concession fee') {
                        console.log("Fee type : ",fee.fee_type);
                        total += Number(fee.amount);
                    }else{
                        total -= fee.amount;
                    }
                }

                feeDetails.push({
                    month_name: monthName,
                    feeDetails: resultArray, 
                    busFee: busFeeAmount,
                    total: total,
                    partialAmount: partialAmount,
                });
            }
            netAmount += total;
            console.log("Month Data : ", monthData);
            console.log("Total Fee for a month : ", total);
            console.log("Net Amount : ", netAmount);
        }

        return {
            statusCode: 200,
            fee: feeDetails,
            netAmount: netAmount
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};


// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// exports.handler = async (event) => {
//     try {
//         console.log("event body : ", event);

//         // Validate required fields
//         if (!event['standard'] || !event['month'] || !event['admission_no'] || event['standard'] === "" || event['month'].length === 0 || event['admission_no'] === "") {
//             return {
//                 statusCode: 400,
//                 body: "Invalid Request: Standard, Month (should be an array), and Admission Number are required."
//             };
//         }

//         console.log("Is Array : ", Array.isArray(event['month']));
//         if (!Array.isArray(event['month'])) {
//             return {
//                 statusCode: 400,
//                 body: "Invalid Request: Month should be in an array."
//             };
//         }

//         // Fetch student data
//         let studentParams = {
//             TableName: "erp_students",
//             Key: {
//                 "admission_no": event['admission_no']
//             }
//         };
//         let studentData = await dynamoDB.get(studentParams).promise();
//         console.log("Student Data : ", studentData);

//         if (studentData['Item'] === undefined) {
//             return {
//                 statusCode: 404,
//                 body: "Invalid Admission Number"
//             };
//         }

//         // Fetch the Fee
//         let params = {
//             TableName: "erp_students_fee",
//             Key: {
//                 "id": event['standard'] + '_' + event['academic_year']
//             }
//         };
//         let fee = await dynamoDB.get(params).promise();
//         console.log("Fee : ", fee);

//         if (fee['Item'] === undefined) {
//             return {
//                 statusCode: 404,
//                 body: `Standard ${event['standard']}th Fee is not updated`
//             };
//         }

//         // Fetch bus fee for the student
//         const busFeeRangeParams = {
//             TableName: 'erp_students_bus_fee_details',
//             Key: {
//                 admission_no: event['admission_no'],
//             },
//         };
//         const busFeeRangeResult = await dynamoDB.get(busFeeRangeParams).promise();
//         console.log("Bus Fee Range Result : ", busFeeRangeResult);
//         let busFeeAmount = 0;

//         if (busFeeRangeResult['Item']) {
//             let busFeeParams = {
//                 TableName: "erp_bus_fee",
//                 Key: {
//                     id: busFeeRangeResult['Item']['range'] + "_" + event['academic_year']
//                 }
//             };

//             let busFeeResult = await dynamoDB.get(busFeeParams).promise();
//             busFeeAmount = Number(busFeeResult['Item']['fee']) || 0;
//         }

//         let feeDetails = [];
//         let netAmount = 0;

//         // Iterate through each month
//         for (let monthName of event['month']) {

//             monthName = monthName.toLowerCase();

//             let total = Number(busFeeAmount);

//             let monthData = fee['Item'][monthName];
//             monthData = fee['Item'][monthName].map(entry => ({
//                 amount: Number(entry.amount),
//                 fee_type: entry.fee_type
//             }));
//             console.log("*******Month Data : ", monthData);

//             if (monthData === undefined) {
//                 return {
//                     statusCode: 404,
//                     body: `${monthName} Month fee Details is not available`
//                 };
//             }

//             // Fetch additional details from fee_details_table
//             const feeDetailsParams = {
//                 TableName: 'erp_fee_details',
//                 Key: {
//                     id: event['admission_no'] + "_" + event['academic_year']
//                 }
//             };

//             const feeDetailsResult = await dynamoDB.get(feeDetailsParams).promise();

//             // Check if fee details are available for the month
//             if (feeDetailsResult['Item'] !== undefined && feeDetailsResult['Item'][monthName] !== undefined) {

//                 console.log("Fee details : ", feeDetailsResult);
//                 console.log("feeDetailsResult['Item'][monthName]['partialAmount'] : ", feeDetailsResult['Item'][monthName]['partialAmount']);


//                 var partialAmount = Number(feeDetailsResult['Item'][monthName]['partialAmount']) || 0;
//                 var remainingAmount = Number(feeDetailsResult['Item'][monthName]['remainingAmount']) || 0;
//                 var totalAmountPaid = Number(feeDetailsResult['Item'][monthName]['total']) || 0;

//                 // Subtract the partial amount from the total

//                 console.log("Total : ", total);
//                 total -= partialAmount;
//                 console.log("Partial amount : ",partialAmount);
//                 console.log("Total : ", total);
//             }
            
//             let previouslyPaidFeeDetails = feeDetailsResult['Item'][monthName]['feeDetails'];
//             console.log(`${monthName} previously Paid Fee Type fee details : `, previouslyPaidFeeDetails);
        
//             if (previouslyPaidFeeDetails.length == 1 && previouslyPaidFeeDetails[0].amount === 0 && previouslyPaidFeeDetails[0].fee_type === '') {
//                 console.log("Fee is not paid.");
                        
//                 for (let i = 0; i < monthData.length; i++) {
//                     console.log("Total : ",total);
//                     total += Number(monthData[i].amount);
//                 }
//                 // console.log("*******Month Data : ", monthData);

//                 feeDetails.push({
//                     month_name: monthName,
//                     feeDetails: monthData,
//                     busFee: busFeeAmount,
//                     total: total,
//                     partialAmount: partialAmount,
//                 });
//             } else {
                
//                 console.log("*******Month Data : ", monthData);

//                 const mergeArrays = (arr1, arr2) => {
//                     return arr1.map(item1 => {
//                         const matchingItem = arr2.find(item2 => item1.fee_type === item2.fee_type);

//                         if (matchingItem) {
//                             // If fee_type exists in both arrays and amount is greater in arr2, replace it
//                             if (matchingItem.amount > item1.amount) {
//                                 return matchingItem;
//                             } else {
//                                 return item1;
//                             }
//                         } else {
//                             // If fee_type is not in arr1, add it
//                             return item1;
//                         }
//                     }).concat(arr2.filter(item2 => !arr1.some(item1 => item1.fee_type === item2.fee_type)));
//                 };

//                 let resultArray = mergeArrays(previouslyPaidFeeDetails, monthData);
//                 resultArray = resultArray.filter(item => item.fee_type.toLowerCase() !== 'bus fee');

//                 console.log("Result Array : ",resultArray);
 
//                 for (let i = 0; i < resultArray.length; i++) {
//                     const fee = resultArray[i];
//                     console.log("Total : ",total);
  
//                     // Check if the fee_type is 'Concession Fee'
//                     if (fee.fee_type.toLowerCase() !== 'concession fee') {
//                         console.log("Fee type : ",fee.fee_type);
//                         total += Number(fee.amount);
//                     }else{
//                         total -= Number(fee.amount);
//                     }
//                 }

//                 feeDetails.push({
//                     month_name: monthName,
//                     feeDetails: resultArray, 
//                     busFee: busFeeAmount,
//                     total: total,
//                     partialAmount: partialAmount,
//                 });
//             }
//             netAmount += total;
//             console.log("Month Data : ", monthData);
//             console.log("Total Fee for a month : ", total);
//             console.log("Net Amount : ", netAmount);
//         }

//         return {
//             statusCode: 200,
//             fee: feeDetails,
//             netAmount: netAmount
//         };
//     } catch (e) {
//         return {
//             statusCode: 500,
//             body: e.message
//         };
//     }
// };



