require ("dotenv/config");
const catchAsync = require("../middleware/catchAsync");

const PreOrder=require("../models/preorder")
const axios=require("axios") // loads env variables from .env file
const CLIENT_ID='AUNLkcvNhdPRRYHKStkeulAEX3GQaYxtrsjkSUn8gVJDtwRYTdsJ4np-yMDsV-vTsDvWnQfGR6jkgRCY'
const APP_SECRET='EFWifg-uOJfHRpNLXgIFNVQgom77ChvbPGUG8S_YUKfLUYe9VuJc2jRCY97TAcYvL2SX0aBBeNieRCbO'
//const { CLIENT_ID, APP_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";

const createOrder=async() => {

  try{
    const accessToken = await generateAccessToken();
    console.log("🚀 ~ file: paypal.js ~ line 10 ~ exports.createOrder=async ~ accessToken", accessToken)
    const url = `${base}/v2/checkout/orders`;
    const response = await axios({url,
      
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data:{
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: "100.00",
            },
          },
        ],
      },
      
      
    });
    const data =  response.data;
    console.log(data);
    return data;

  }catch(e){
    console.log("🚀 ~ file: paypal.js ~ line 35 ~ exports.createOrder=async ~ e", e)
    return {e:e.toString()};

  }

}
exports.createOrder=createOrder


  exports.capturePayment=async(orderId)=> {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await axios ({url,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = response.data;
  console.log(data);
  return data;
}


  const generateAccessToken=async()=> {

  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")

  const response = await axios.post(base + "/v1/oauth2/token", 
  new URLSearchParams({
    'grant_type': 'client_credentials'
}),
 
     {
        auth: {
          username: CLIENT_ID,
          password: APP_SECRET
      }
    },
  );
  const data =  response.data;
  console.log("🚀 ~ file: orders.js ~ line 688 ~ generateAccessToken ~ response", response.data.access_token)
  return data.access_token;
}




exports.pay = catchAsync(async (req, res, next) => {
  //console.log("first")
console.log("object");
  let totalAmount = req.body.totalAmount;

  let firstName = req.body.Name;

  let address = req.body.address;

  console.log(req.body);

  let carts;
  let orderNumber;
  try {
    carts = req.body.products;

    if (!firstName.trim() || !address.trim()) {
      res.status(400);
      res.json({
        error: {
          message: "firstName , lastName , address Required..",
        },
      });
      return;
    }
  } catch (error) {
    res.status(400);
    if (!carts) {
      res.json({
        error: {
          message: "Products Required..",
        },
      });
      return;
    }
    res.json({
      error: {
        message: "firstName , lastName , address Required..",
      },
    });
    return;
  }

  try {
    const amount_cents = totalAmount * 100;

    const items = req.body.products.map((p) => {
      return {
        name: p.name,
        sku: p.name,
        price: p.price,
        currency: "USD",
        quantity: p.count,
      };
    });
  
    let id
    
    const order = await createOrder();
        id=order.id
    
        console.log('id ',id)
      const preOrder = new PreOrder({
        product: req.body.products,
        totalAmount: req.body.totalAmount,
        orderNumber: id,
        firstName: req.body.Name,
        address: req.body.address,
        phone: req.body.phone,
      });
    const preorder = await preOrder.save();
    console.log("🚀 ~ file: orders.js ~ line 250 ~ exports.pay=catchAsync ~ preorder", preorder)
    res.json(order);

  } catch (error) {
  console.log("🚀 ~ file: orders.js ~ line 248 ~ exports.pay=catchAsync ~ error", error.toString())
    res.send(error)
  }
 
});
