const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

// Function to format the current date and time in 'Asia/Kolkata' timezone
var time = new Date();
var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

exports.handler = async (event) => {
    try {
        console.log("Event Body : ", event);

        // Validate required fields
        if (!event['extraFee'] || !event['receiptAmount'] || !event['month'] || !event['admission_no'] || !event['academic_year']) {
            return {
                statusCode: 400,
                body: "Invalid Request: ExtraFee, Month, Academic year and Admission Number are required."
            };
        }

        // Validate month as an array
        if (!Array.isArray(event['month']) || !Array.isArray(event['extraFee'])) {
            return {
                statusCode: 400,
                body: "Invalid Request: Month should be an array."
            };
        }

        // Fetch student data from DynamoDB
        let studentParams = {
            TableName: "erp_students",
            Key: {
                "admission_no": event['admission_no']
            }
        };
        let studentData = await dynamoDB.get(studentParams).promise();

        // Handle invalid admission number
        if (!studentData['Item']) {
            return {
                statusCode: 404,
                body: "Invalid Admission Number"
            };
        }

        // Fetch standard from fee details table
        const feeDetailsParams = {
            TableName: 'erp_fee_details',
            Key: {
                id: event['admission_no'] + "_" + event['academic_year']
            }
        };
        const feeDetailsResult = await dynamoDB.get(feeDetailsParams).promise();
        let standard = feeDetailsResult['Item']['standard'];

        // Fetch the fee for the student
        let params = {
            TableName: "erp_students_fee",
            Key: {
                'id': event['standard'] + '_' + event['academic_year']
            }
        };
        let fee = await dynamoDB.get(params).promise();

        // Handle missing fee details
        if (!fee['Item']) {
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
        let busFeeAmount = 0;

        if (busFeeRangeResult['Item']) {
            let busFeeParams = {
                TableName: "erp_bus_fee",
                Key: {
                    id: busFeeRangeResult['Item']['range'] + "_" + event['academic_year']
                }
            };

            let busFeeResult = await dynamoDB.get(busFeeParams).promise();
            busFeeAmount = Number(busFeeResult['Item']['fee']);
        }

        let feeDetails = [];
        let netAmount = 0;
        let payableAmount = event['receiptAmount'];
        let receipt = "DSF" + Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);

        // Iterate through each month
        console.log("MONTH LOOP START : ");
        for (let index = 0; index < event['month'].length; index++) {
            let monthName = event['month'][index].toLowerCase();
            let total = 0;

            let monthData = fee['Item'][monthName];
            let temp = 0;
            console.log("######## Month Data : ", monthData);

            if (!monthData) {
                return {
                    statusCode: 404,
                    body: `${monthName} Month fee Details is not available`
                };
            }

            monthData = fee['Item'][monthName].map(entry => ({
                amount: Number(entry.amount),
                fee_type: entry.fee_type
            }));

            if (feeDetailsResult['Item'] && feeDetailsResult['Item'][monthName]) {

                // Fetch additional details from fee_details_table
                var partialAmount = feeDetailsResult['Item'][monthName]['partialAmount'] || 0;
                var remainingAmount = feeDetailsResult['Item'][monthName]['remainingAmount'] || 0;
                var totalAmountPaid = feeDetailsResult['Item'][monthName]['total'] || 0;
                var commonFee = feeDetailsResult['Item'][monthName]['commonFee'] || 0;
            }
            
            console.log("partialAmount : ",partialAmount);
            console.log("remainingAmount : ",remainingAmount);
            console.log("totalAmountPaid : ",totalAmountPaid);
            console.log("commonFee : ",commonFee);
            
            
            const busFeeDetails = {
                amount: busFeeAmount,
                fee_type: "Bus Fee"
            };
            monthData.push(busFeeDetails);

            for (let i = 0; i < monthData.length; i++) {
                temp += Number(monthData[i].amount);
            }
            
            console.log("Temporary Fee (Included Bus fee or commonFee) : ",temp);

            let admission_fee = {
                amount: event['extraFee'][index]['admission'],
                fee_type: "Admission Fee"
            };
            monthData.push(admission_fee);

            let uniform_fee = {
                amount: event['extraFee'][index]['uniform'],
                fee_type: "Uniform Fee"
            };
            monthData.push(uniform_fee);

            let bssbi_fee = {
                amount: event['extraFee'][index]['bssbi'],
                fee_type: "Bag, Shoe, Socks, Belt, Id Card"
            };
            monthData.push(bssbi_fee);

            let pss_fee = {
                amount: event['extraFee'][index]['pss'],
                fee_type: "P.T Dress, Shoes & Socks"
            };
            monthData.push(pss_fee);

            let winterClothes_fee = {
                amount: event['extraFee'][index]['winterClothes'],
                fee_type: "Winter Clothes"
            };
            monthData.push(winterClothes_fee);

            let book_fee = {
                amount: event['extraFee'][index]['books'],
                fee_type: "Book Fee"
            };
            monthData.push(book_fee);

            let copy_fee = {
                amount: event['extraFee'][index]['copy'],
                fee_type: "Copy Fee"
            };
            monthData.push(copy_fee);

            let miscellaneous_fee = {
                amount: event['extraFee'][index]['miscellaneous'],
                fee_type: "Miscellaneous Fee"
            };
            monthData.push(miscellaneous_fee);

            // Calculate total fee for the month
            for (let i = 0; i < monthData.length; i++) {
                total += Number(monthData[i].amount);
            }
            
            console.log(`${monthName} Total Fee Sum : `,total);
            console.log(`${monthName} Fee Details : `,monthData);
            
            if (totalAmountPaid < total) {
                totalAmountPaid = total;
            }

            // Include concession fee if available 
            if (event['extraFee'][index]['concessionFee'] !== 0) {
                let concessionFeeDetails = {
                    amount: event['extraFee'][index]['concessionFee'],
                    fee_type: "Concession Fee"
                };

                monthData.push(concessionFeeDetails);
                total -= Math.round(Number(concessionFeeDetails['amount']) * 100) / 100;
            }

            if (remainingAmount != 0) {
                let temp1 = total - commonFee;
                total = remainingAmount + temp1;
            }

            var firstArray = feeDetailsResult['Item'][monthName]['feeDetails'];

            let secondArray = monthData;

            // List of fee types to be added
            const feeTypesToAdd = ['concessionFee', 'Admission Fee', 'Uniform Fee', 'Bag, Shoe, Socks, Belt, Id Card', 'P.T Dress, Shoes & Socks', 'Winter Clothes', 'Book Fee', 'Copy Fee', 'Miscellaneous Fee'];

            for (const fee of firstArray) {
                // Skip if fee_type is empty or not in the list
                if (!fee.fee_type || !feeTypesToAdd.includes(fee.fee_type)) {
                    continue;
                }

                const existingFee = secondArray.find(item => item.fee_type === fee.fee_type);

                if (!existingFee) {
                    // Add fee from the first array to the second array if fee_type doesn't exist
                    secondArray.push({ fee_type: fee.fee_type, amount: fee.amount });
                } else {
                    // Add the amount if fee_type exists in both arrays
                    existingFee.amount += fee.amount;
                }
            }

            monthData = secondArray;
            console.log("BEFORE CALLING THE PAYMENT FUNCTION : ");
            console.log("Total Amount paid : ",totalAmountPaid);
            console.log("payableAmount : ",payableAmount);
            console.log("Total : ",total);
            
            var feeStatus = await updateFeeDb(event, monthName, monthData, total, payableAmount, receipt, totalAmountPaid, feeDetailsResult, temp);

            if (feeStatus) {
                feeDetails.push({
                    month_name: monthName,
                    receipt: receipt,
                    amountPaid: payableAmount,
                    paymentDateTime: dateTime,
                });
            }

            payableAmount -= total;
            netAmount += total;
        }

        // Check if fee update was successful
        if (feeStatus) {
            // Register the fee in the accounting system
            let accountParams = {
                type: "fee",
                subtype: event['admission_no'],
                from: event['admission_no'],
                to: "School Accounts",
                amount: event['receiptAmount'].toString(),
                description: "Fee Collection",
                paymentType: "Cash",
                creatorRole: event['creatorRole'],
                creatorName: event['creatorName'],
                creatorId: event['creatorId']
            };

            let acc = await registerAccount(accountParams);
            console.log("Accounting: ", acc);

            return {
                statusCode: 200,
                body: "Fee updated successfully",
                receipt: receipt,
                paymentDateTime: dateTime,
            };
        } else {
            return {
                statusCode: 400,
                body: "Unable to update fee"
            };
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
};

// Function to update fee details in DynamoDB
async function updateFeeDb(event, month, feeDetails, total, payableAmount, receipt, totalAmountPaid, feeDetailsResult, commonFee) {
    try {
        
        console.log("INSIDE PAYMENT FUNCTION : ");
        console.log("payableAmount >= total : ",payableAmount >= total);
        let paid = payableAmount >= total;
        
        console.log("paid ? 0 : Number(payableAmount)  : ",paid ? 0 : Number(payableAmount));
        let partialAmount = paid ? 0 : Number(payableAmount); 
        
        console.log("paid ? 0 : Number(total - payableAmount) : ",paid ? 0 : Number(total - payableAmount));
        let remainingAmount = paid ? 0 : Number(total - payableAmount);

        // Get the previous partial amount from the feeDetailsResult
        let previousPartialAmount = 0;
        if (feeDetailsResult['Item'] && feeDetailsResult['Item'][month]) {
            previousPartialAmount = feeDetailsResult['Item'][month]['partialAmount'] || 0;
        }

        // Add the previous and current partial amounts
        partialAmount += previousPartialAmount;

        if(remainingAmount == 0){ 
            partialAmount = 0;
        }
        
        let updateCurrent = {
            paid: paid,
            partialAmount: partialAmount,
            partialPaid: !paid,
            remainingAmount: remainingAmount,
            month_name: month.toLowerCase(), 
            receipt: receipt,
            razorpay_order_id: "",
            razorpay_payment_id: "",
            total: totalAmountPaid,
            mode: "offline",
            feeDetails: feeDetails,
            paymentDateTime: dateTime,
            commonFee: commonFee
        };
        
        console.log("Update Current : ",updateCurrent);

        const params = {
            TableName: "erp_fee_details",
            Key: {
                id: event["admission_no"] + "_" + event['academic_year']
            },
            UpdateExpression: "SET #month = :month",
            ExpressionAttributeNames: {
                "#month": month,
            },
            ExpressionAttributeValues: {
                ":month": updateCurrent,
            },
        };

        await dynamoDB.update(params).promise();
        return true;
    } catch (e) {
        return false;
    }
}

// Function to register an accounting entry
async function registerAccount(accountParams) {
    const params = {
        FunctionName: 'sanford_accounting_income_collection',
        Payload: JSON.stringify(accountParams)
    };
    let data = await lambda.invoke(params).promise();
    console.log(data);
    return data;
}



// const AWS = require('aws-sdk');
// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const lambda=new AWS.Lambda;

// var time = new Date();
// var dateTime = new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });


// exports.handler = async (event) => {
//     try {
//         console.log("event body : ", event);
//         if (event['extraFee'] == "" || event['extraFee'] == undefined || event['receiptAmount'] == "" || event['receiptAmount'] == undefined || event['month'] == "" || event['month'] == undefined || event['admission_no'] == "" || event['admission_no'] == undefined) {
//             return {
//                 statusCode: 400,
//                 body: "Invalid Request : ExtraFee/Month/Admission Number is Required"
//             };
//         }
//         console.log("Is Array : ", Array.isArray(event['month']));
//         if (!Array.isArray(event['month']) && !Array.isArray(event['extraFee'])) {
//             return {
//                 statusCode: 400,
//                 body: "Invalid Request : Month should be in Array"
//             };
//         }


//         let studentParams = {
//             TableName: "erp_students",
//             Key: {
//                 "admission_no": event['admission_no']
//             }
//         };

//         let studentData = await dynamoDB.get(studentParams).promise();
//         console.log("Student Data : ", studentData);

//         if (studentData['Item'] == undefined) {
//             return { 
//                 statusCode: 404,
//                 body: "Invalid Admission Number"
//             };
//         }
        
//         const feeDetailsParams = {
//                 TableName: 'erp_fee_details',
//                 Key: {
//                     id: event['admission_no'] + "_" + event['academic_year']
//                 }
//             };
 
//          const feeDetailsResult = await dynamoDB.get(feeDetailsParams).promise();
//          let standard = feeDetailsResult['Item']['standard'];


//         // Fetch the Fee
//         let params = {
//             TableName: "erp_students_fee",
//             Key: {
//                 'id' : event['standard'] + '_' + event['academic_year']
//             }
//         };        
//         console.log("Fee Details Params : ",params);

//         let fee = await dynamoDB.get(params).promise();
//         console.log("Fee Details Data : ", fee);

//         if (fee['Item'] == undefined) {
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

//         if (busFeeRangeResult['Item'] != undefined) {
//             let busFeeParams = {
//                 TableName: "erp_bus_fee",
//                 Key: {
//                     id : busFeeRangeResult['Item']['range'] + "_" + event['academic_year']
//                 }
//             };

//             let busFeeResult = await dynamoDB.get(busFeeParams).promise();
//             console.log("Bus Fee Range : ", busFeeResult);
//             busFeeAmount = Number(busFeeResult['Item']['fee']);
//         } else {
//             console.log("Bus Amount Fee : ", busFeeAmount);
//         }

//         let feeDetails = [];
//         let netAmount = 0;

//         // Iterate through each month
//         console.log("Loop strat");
//         let payableAmount = event['receiptAmount'];
//         var receipt = "DSF" + Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
//         for (let index = 0 ; index < event['month'].length ; index++) {

//             let monthName = event['month'][index].toLowerCase();
//             let total = 0;

//             const monthData = fee['Item'][monthName];
//             console.log(`${monthName} Month Data : `, monthData);

//             if (fee['Item'][monthName] == undefined) {
//                 return {
//                     statusCode: 404,
//                     body: `${monthName} Month fee Details is not available`
//                 };
//             }
//             console.log("Fetch additional details from fee_details_table");
            
//             // Fetch additional details from fee_details_table
//             // const feeDetailsParams = {
//             //     TableName: 'erp_fee_details',
//             //     Key: {
//             //         id: event['admission_no'] + "_" + studentData['Item']['academic_year']
//             //     }
//             // };
 
//             // const feeDetailsResult = await dynamoDB.get(feeDetailsParams).promise();

//             // Check if fee details are available for the month
//             console.log("Check if fee details are available for the month");
//             if (feeDetailsResult['Item'] != undefined && feeDetailsResult['Item'][monthName] != undefined) {

//                 var partialAmount = feeDetailsResult['Item'][monthName]['partialAmount'];
//                 var remainingAmount = feeDetailsResult['Item'][monthName]['remainingAmount'];
                
//                 console.log("####### partial Amount : ",partialAmount);
//                 console.log("####### Remaining Amount : ",remainingAmount);
                
//                 if (feeDetailsResult['Item'][monthName]['partialAmount'] == null) {
//                     partialAmount = 0;
//                 }
                
//                 if (feeDetailsResult['Item'][monthName]['remainingAmount'] == null) {
//                     remainingAmount = 0;
//                 }
                
//                 console.log("Partial Amount : ",partialAmount);
//                 console.log("Remaining Amount : ",remainingAmount);

//                 // Subtract the partial amount from the total
//                 total -= partialAmount;
//             }
//             const busFeeDetails = {
//                 amount: busFeeAmount,
//                 fee_type: "Bus Fee"
//             };

//             monthData.push(busFeeDetails);
            
//             console.log("fee details push in month data");
//             console.log(`${monthName} fee details : `,monthData);
            
//             for (let i = 0; i < monthData.length; i++) {
//                 total += Number(monthData[i].amount);
//             } 
            
//             console.log("### conccessionfee : ",event['extraFee'][index]);
            
//             if(event['extraFee'][index] != 0){
                 
//                 var concessionFeeDetails = {
//                     amount : event['extraFee'][index],
//                     fee_type : "Concession Fee" 
//                 };
            
//                 monthData.push(concessionFeeDetails);
//                 console.log("Total : ",total);
//                 total -= (Math.round((Number(concessionFeeDetails['amount'])) * 100) / 100).toFixed(2);
//             }
            
            
//             console.log(`${monthName} fee details : `,monthData);
//             console.log("Total : ",total);

//             var feeStatus;
//             console.log("fee detailss : ",feeDetailsResult['Item'][monthName]['mode']);
//             let lastMonthTotal = Number(feeDetailsResult['Item'][monthName]['total']);
            

//             if(payableAmount > 0 && total <= payableAmount ){ 
//                 // for full payment
//                 console.log("payableAmount : ",payableAmount);
//                 console.log("Total : ",total);
//                 if(partialAmount != 0 && remainingAmount != 0){
                    
//                     console.log("First if... Partial ! 0 ");
//                     console.log("Last Month Total : ",lastMonthTotal);
//                     feeStatus = await updateFeeDb(event, monthName, monthData, lastMonthTotal, false, 0,0,true,receipt);
//                 }
//                 else{
                     
//                     console.log("First if else... Partial ! 0 "); 
//                     console.log("Month Total : ",total);
//                     feeStatus = await updateFeeDb(event, monthName, monthData, total, false,0,0,true,receipt);
//                 }
                
//                 feeDetails.push({
//                             month_name: monthName,
//                             receipt: receipt,
//                             amountPaid: total,
//                             paymentDateTime: dateTime, 
//                 });
//             }
//             else {
//                 // for partial fee
                
//                 console.log("payableAmount : ",payableAmount);
//                 console.log("Total : ",total);
//                 if(partialAmount != 0 && remainingAmount != 0){
                    
//                     console.log("Else if... Partial ! 0 ");
//                     console.log("@@@@Last Month Total : ",lastMonthTotal);
//                      console.log("@@@@@ partial Amount : ",partialAmount); 
//                       console.log("@@@@ Remaining Amount : ",remainingAmount);
//                      console.log("@@@@ payableAmount : ",payableAmount);
                      
//                     let pf = Number((Math.round((partialAmount + payableAmount) * 100) / 100).toFixed(2));
//                     console.log("parital fee : ",pf);
//                     let rf =  Number(Math.round((lastMonthTotal - ( payableAmount + partialAmount)) * 100) / 100).toFixed(2);
//                     console.log("Remaining : ",rf);
//                     feeStatus = await updateFeeDb(event, monthName, monthData, lastMonthTotal, true, pf ,rf,false,receipt);
                    
//                     feeDetails.push({
//                             month_name: monthName,
//                             receipt: receipt,
//                             amountPaid: pf,
//                             paymentDateTime: dateTime, 
//                     });
//                 }  
//                 else{
                    
//                     console.log("Else if else... Partial ! 0 ");
//                     console.log("Month Total : ",total);
//                     console.log("Partial fee : ",payableAmount);
//                     console.log("Remaining : ",total-payableAmount);
//                     let ra = (Math.round((total - payableAmount) * 100) / 100).toFixed(2);
//                     total = Number(total + Number(event['extraFee'][index]));
//                     console.log("$$$$ Total : ",total);
//                     payableAmount = Number(payableAmount + Number(event['extraFee'][index])) ;
//                     feeStatus = await updateFeeDb(event, monthName, monthData, total, true, payableAmount,ra,false,receipt); 
//                   feeDetails.push({
//                             month_name: monthName,
//                             receipt: receipt,
//                             amountPaid: payableAmount,
//                             paymentDateTime: dateTime,
//                     });
//                 }
//             }

//             payableAmount -= total; 
            
//             console.log("Remaining amount : ",payableAmount);  

//             // let monthlyfee = {
//             //     month_name: monthName,
//             //     feeDetails: monthData,
//             //     busFee: busFeeAmount,
//             //     total: total,
//             //     partialAmount: partialAmount,
//             // }

//             // feeDetails.push(monthlyfee);

//             netAmount += total;
//             console.log("Total Fee for a month : ", total);
//             console.log("Net Amount : ", netAmount);
//         }

//         console.log("Fee Status : ",feeStatus);
//         if (feeStatus == true) {
            
//             let accountParams = {
//               "type": "fee",
//               "subtype": event['admission_no'],
//               "from": event['admission_no'],
//               "to": "School Accounts",
//               "amount": event['receiptAmount'].toString(),
//               "description": "Fee Colection",
//               "paymentType": "Cash",
//               "creatorRole": event['creatorRole'],
//               "creatorName": event['creatorName'],
//               "creatorId": event['creatorId']
//             };
            
//             let acc =await Register(accountParams); 
//             console.log("Accounting  : ",acc);
            
//             return {
//                 statusCode: 200,
//                 body: "Fee updated successfully",
//                 receipt: receipt, 
//                 paymentDateTime: dateTime,
//                 // feeDetails: feeDetails
//             };
//         } else {
//             return {
//                 statusCode: 400,
//                 body: "Unable to update fee"
//             };
//         }
//     } catch (e) {
//         return {
//             statusCode: 500, 
//             body: e.message
//         }; 
//     } 
// };


// async function updateFeeDb(event, month, feeDetails, amount, partialFeeStatus, partialAmount,remainingAmount, paidStatus,receipt) {
//     try {
//         console.log("Month Name in updateFeeDb : ", month);

//         let updateCurrent = {
//             paid: paidStatus,
//             partialAmount: Number(partialAmount),
//             partialPaid : partialFeeStatus,
//             remainingAmount: Number(remainingAmount),
//             // partialAmount: partialAmount,
//             month_name: month.toLowerCase(),
//             receipt: receipt,
//             razorpay_order_id: "", 
//             razorpay_payment_id: "",
//             total: Number(amount),
//             mode: "offline",
//             feeDetails: feeDetails,
//             paymentDateTime: dateTime,                                 // new Date().toLocaleDateString()

//         };
        
//         console.log("Updae Current : ",updateCurrent);

//         const params = {
//             TableName: "erp_fee_details",
//             Key: {
//                 id: event["admission_no"] + "_" + event['academic_year']
//             },
//             UpdateExpression: "SET #month = :month",
//             ExpressionAttributeNames: {
//                 "#month": month,
//             },
//             ExpressionAttributeValues: {
//                 ":month": updateCurrent,
//             },
//         };
//         console.log("updateFeeDb params : ",params); 
//         await dynamoDB.update(params).promise();
//         return true;
//     } catch (e) {
//         return false;
//     }
// }


// async function Register(accountParams){
//  const params={
//         FunctionName:'sanford_accounting_income_collection', 
//         Payload:JSON.stringify(accountParams)
//     };
//     let data=await lambda.invoke(params).promise();
//     console.log(data);
//     return data;
// }

