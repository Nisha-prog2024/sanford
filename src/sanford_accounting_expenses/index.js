
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    console.log("Event Body : ", event);
    let params;

    let transactionId = "Trnx" + Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);

    var time = new Date();
    var dateTime = new Date(time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
    var timeList = dateTime.split(',');
    var date = timeList[0].trim();
    time = timeList[1].trim();
    console.log(time);
    console.log(date);
    
    let month = date.split('/')[1];
    let year = date.split('/')[2];
   console.log("month : ",month);
    console.log("year : ",year);

    const creditData = await getItemsByType('credit',event['paymentType'].toLowerCase());
    const debitData = await getItemsByType('debit',event['paymentType'].toLowerCase());
    
    // console.log("Credit Data : ",creditData);
    // console.log("Debit Data : ",debitData);

    // Calculate total credit and debit amounts
    const totalCredit = calculateTotalAmount(creditData,"credit");
    const totalDebit = calculateTotalAmount(debitData,"debit");
    
    
    console.log("Logic start here");
    let gst;
    let discount;
    
    if(event['gst'] == "" || event['gst'] == undefined){
      gst = "0.00";
      var gstAmount = "0.00";
    }
    else{
      gst = event['gst'];
      gstAmount =  Number (((event['amount'])*gst)/100);
    }
    
    console.log("Gst : ",gst);
    console.log("Gst Amount : ",gstAmount);
    
    if(event['discount'] == "" || event['discount'] == undefined){
      discount = "0.00";
      var discountAmount = "0.00";
    }
    else{
      discount = event['discount'];
       discountAmount = Number(((event['amount'])*discount)/100);
    
    }
    
    console.log("Discount : ",discount);
    console.log("Discount Amount : ",discountAmount);
  
    
    let totalAmount = ((Number(event['amount']) + Number(gstAmount)) - Number(discountAmount));
    totalAmount = totalAmount.toFixed(2);
    console.log("Total Amount : ",totalAmount);
    
    if(event['quantity'] == "" || event['quantity'] == undefined){
      var quantity = "0";
    }
    else{
      quantity = event['quantity'];
      totalAmount = ( Number(quantity) * totalAmount );
    }
    console.log("Total Credit : ",totalCredit);
    console.log("Total Debit : ",totalDebit);
    
    let total = (totalCredit - totalDebit) - totalAmount;
    console.log("Total : ",total);
    
    console.log("Total Amount : ",totalAmount);
    console.log("GST : ",gst);
    console.log("GST AMOUNT :",gstAmount);
    console.log("Discount : ",discount);
    console.log("Discount Amount : ",discountAmount);
    console.log("Quantity : ",quantity);
    console.log("Total : ",total);
    
    if(total < 0){
      return {
        statusCode : 400, 
        body : "Insufficient Balance"
      };
    }
    

    switch (event['type'].toLowerCase()) {
      case 'events':
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: "events",
            subType : event['subtype'].toLowerCase(),
            from: event['from'],
            to : event['to'],
            creatorRole : event['creatorRole'].toLowerCase(),
            creatorName : event['creatorName'].toLowerCase(),
            creatorId : event['creatorId'],
            description: event['description'].toLowerCase(),
            credit: "0.00",
            debit: (Math.round(totalAmount * 100) / 100).toFixed(2),
            gst : gst,
            discount : discount,
            amount: event['amount'],
            paymentType : event['paymentType'].toLowerCase(),
            total : (Math.round(total * 100) / 100).toFixed(2),
            month : month,
            year : year,
            review : "false", 
            pk : "1",
            tstamp : Number(Date.now())

          }
        };
        console.log("Params : ",params);
        break;
      case 'purchases':
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: "purchases",
            subType : event['subtype'].toLowerCase(),
            quantity : event['quantity'],
            from: event['from'],
            to : event['to'],
            creatorRole : event['creatorRole'].toLowerCase(),
            creatorName : event['creatorName'].toLowerCase(),
            creatorId : event['creatorId'],
            description: event['description'].toLowerCase(),
            credit: "0.00",
            debit: (Math.round(totalAmount * 100) / 100).toFixed(2),
            gst : gst,
            discount : discount,
            amount : event['amount'],
            paymentType : event['paymentType'].toLowerCase(),
            total : (Math.round(total * 100) / 100).toFixed(2),
            month : month,
            year : year,
            review : "false",
            pk : "1",
            tstamp : Number(Date.now())

          }
        };
        console.log("Params : ",params);
        break;
      case 'logistic' : 
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: "logistic",
            subType : event['subtype'].toLowerCase(),
            from: event['from'],
            to : event['to'],
            creatorRole : event['creatorRole'].toLowerCase(),
            creatorName : event['creatorName'].toLowerCase(),
            creatorId : event['creatorId'],
            description: event['description'].toLowerCase(),
            credit: "0.00",
            debit: (Math.round(totalAmount * 100) / 100).toFixed(2),
            gst : gst,
            discount : discount,
            amount : event['amount'],
            paymentType : event['paymentType'].toLowerCase(),
            total : (Math.round(total * 100) / 100).toFixed(2),
            month : month,
            year : year,
            review : "false",
            pk : "1",
            tstamp : Number(Date.now())

          }
        };
        console.log("Params : ",params);
        break;
      case 'salary' : 
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: "salary",
            subType : event['subtype'].toLowerCase(),
            from: event['from'],
            to : event['to'],
            creatorRole : event['creatorRole'].toLowerCase(),
            creatorName : event['creatorName'].toLowerCase(),
            creatorId : event['creatorId'],
            description: event['description'].toLowerCase(),
            credit: "0.00",
            debit: (Math.round(totalAmount * 100) / 100).toFixed(2),
            gst : gst,
            discount : discount,
            amount : event['amount'],
            paymentType : event['paymentType'].toLowerCase(),
            total : (Math.round(total * 100) / 100).toFixed(2),
            month : month,
            year : year,
            review : "false",
            pk : "1",
            tstamp : Number(Date.now())

          }
        };
        console.log("Params : ",params);
        break;
      case 'other':
        params = {
          TableName: "sanford_accounting",
          Item: {
            transactionId: transactionId,
            transactionDate: date,
            transactionTime: time,
            type: "other",
            subType : event['subtype'].toLowerCase(),
            from: event['from'],
            to : event['to'],
            creatorRole : event['creatorRole'].toLowerCase(),
            creatorName : event['creatorName'].toLowerCase(),
            creatorId : event['creatorId'],
            description: event['description'].toLowerCase(),
            credit: "0.00",
            debit: (Math.round(totalAmount * 100) / 100).toFixed(2),
            gst : gst,
            discount : discount,
            amount: event['amount'],
            paymentType : event['paymentType'].toLowerCase(),
            total : (Math.round(total * 100) / 100).toFixed(2),
            month : month,
            year : year,
            review : "false",
            pk : "1",
            tstamp : Number(Date.now())

          }
        };
        console.log("Params : ",params);
        break;
      default: 
        return {
          statusCode: 400,
          body: "Invalid type"
        };
    }
    await dynamodb.put(params).promise();
    
    let getParams = {
      TableName : 'sanford_accounting',
      Key : {
        'transactionId' : 'startingBalance'
      }
    };
    
    let data = await dynamodb.get(getParams).promise();
    console.log("starting Balance : ",data);
    
    if(data['Item'] != undefined){
      let totalStartingBalance = Number(data['Item'][event['paymentType'].toLowerCase()] ) - Number(totalAmount);
      let putParams = {
      TableName : 'sanford_accounting',
      Key : {
        'transactionId' : 'startingBalance'
      },
      UpdateExpression : 'SET #paymentType = :val1',
      ExpressionAttributeNames: {
        '#paymentType' : event['paymentType'].toLowerCase()
      },
      ExpressionAttributeValues: {
        ':val1' : totalStartingBalance.toFixed(2)
      }
    };
    console.log("Put Params : ",putParams);
    await dynamodb.update(putParams).promise();
    }
    
    
    
    return {
      statusCode: 200,
      body: 'Expanses details stored successfully',
    };


  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};


// Function to retrieve items from DynamoDB based on type (credit/debit)
const getItemsByType = async (type,paymentType) => {
  const params = {
    TableName: 'sanford_accounting',
    FilterExpression: ' ( #type <> :val AND #paymentType = :val1)',
    ExpressionAttributeNames: {
        '#paymentType': 'paymentType',
        '#type': type,
    },
    ExpressionAttributeValues: {
      ':val' : '0.00',
      ':val1' : paymentType
    },
  };
  // console.log("params : ",params);
  const result = await dynamodb.scan(params).promise();
  // console.log("Credit / Debit Result : ",result);
  return result.Items || [];
};

// Function to calculate total amount from an array of items
const calculateTotalAmount = (items,type) => {
  let total = 0;
  
  for(const item of items){
    console.log(`${type} Amount : `,item[type]);
    total += Number(item[type]);
  }
  return total;
  
};