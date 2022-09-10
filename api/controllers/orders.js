const mongoose = require("mongoose");
const Order = require("../models/order");
const preOrder = require("../models/preorder");
const catchAsync = require("../middleware/catchAsync");
const Product = require("../models/product");
var sha512 = require("js-sha512");
var paypal = require("paypal-rest-sdk");
const { productCount } = require("../controllers/products");
const axios = require("axios");
 
//const { CLIENT_ID, APP_SECRET } = process.env;
const CLIENT_ID='AUNLkcvNhdPRRYHKStkeulAEX3GQaYxtrsjkSUn8gVJDtwRYTdsJ4np-yMDsV-vTsDvWnQfGR6jkgRCY'
const APP_SECRET='EFWifg-uOJfHRpNLXgIFNVQgom77ChvbPGUG8S_YUKfLUYe9VuJc2jRCY97TAcYvL2SX0aBBeNieRCbO'
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:CLIENT_ID,
  // "AUNLkcvNhdPRRYHKStkeulAEX3GQaYxtrsjkSUn8gVJDtwRYTdsJ4np-yMDsV-vTsDvWnQfGR6jkgRCY",
  client_secret:APP_SECRET,
    //"EFWifg-uOJfHRpNLXgIFNVQgom77ChvbPGUG8S_YUKfLUYe9VuJc2jRCY97TAcYvL2SX0aBBeNieRCbO",

});

exports.getAllOrders = async(req, res, next) => {

  if (req.userData.userType == "user") {
    console.log(req.userData);
    Order.find({ user: req.userData.userId })
      .sort("-created_at")
      .populate({
        path: "product.id",
      })
      .populate("user")
      .exec()
      .then((orders) => {
        return res.status(200).json({
          count: orders.length,
          orders: orders,
        });
      })
      .catch((error) => {
        next(error);
      });
    return;
  }

  let o;
  if (req.userData.userType == "admin" && req.query.all) o = Order.find();
  else {
    o = Order.find({ user: req.userData.userId });
  }

  o.select()
    .populate({
      path: "product.id",
    })
    .populate("user")
    .sort("-created_at")
    .exec()
    .then((orders) => {
      res.status(200).json({
        count: orders.length,
        orders: orders,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.saveOrders = (req, res, next) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let address = req.body.address;

  console.log(req.body.products);

  let carts;
  try {
    carts = req.body.products;
    console.log("🚀 ~ file: orders.js ~ line 72 ~ carts", carts);
    if (!firstName.trim() || !lastName.trim() || !address.trim()) {
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
  console.log("first");
  let orders = [];
  for (let i = 0; i < carts.length; i++) {
    orders.push(createpreOrder(req, carts[i], firstName, lastName, address));
  }

  Order.create(orders)
    .then((orders) => {
      return res.status(201).json({
        message: "Orders were created",
        orders,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getOneOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .select()
    .populate("product user")
    .exec()
    .then((order) => {
      return res.status(201).json(order);
    })
    .catch((error) => {
      next(error);
    });
};

exports.pay = catchAsync(async (req, res, next) => {
  //console.log("first")

  let totalAmount = req.body.totalAmount;

  let firstName = req.body.Name;

  let address = req.body.address;

  console.log(req.body);

  let carts;
  let orderNumber;
  try {
    carts = req.body.products;
    console.log("🚀 ~ file: orders.js ~ line 72 ~ carts", carts);
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
  let x=1
    var create_payment_json = {
      "intent": "ORDER",
      "payer": {
    
          //"payment_method": "CREDIT_CARD"
          //BANK, CARRIER, ALTERNATE_PAYMENT, PAY_UPON_INVOICE
      }, 
      /* "purchase_units": [
        {
          "amount": {
            "currency_code": "USD",
            "value": "500",
            "breakdown": {
              "item_total": {
                "currency_code": "USD",
                "value": "500"
              }
            }
          },
          "items": [
            {
              "name": "Name of Item #1 (can be viewed in the upper-right dropdown during payment approval)",
              "description": "Optional description; item details will also be in the completed paypal.com transaction view",
              "unit_amount": {
                "currency_code": "USD",
                "value": "500"
              },
              "quantity": "1"
            }
          ]
        }
      ], */
      "redirect_urls": {
          "return_url": "https://pure-honey.herokuapp.com/api/orders/callback",
          "cancel_url": "https://www.pure-eg.com/cart/paymenterror",
      },
      "transactions": [{
          "item_list": {
              items
          },
          "amount": {
              "currency": "USD",
              "total": `${totalAmount}`
          },
          "description": "This is the payment description."
      }]
  };
    console.log("🚀 ~ file: orders.js ~ line 217 ~ exports.pay=catchAsync ~ create_payment_json", create_payment_json.transactions)
    let id
    JSON.stringify(create_payment_json)
    console.log("🚀 ~ file: orders.js ~ line 215 ~ exports.pay=catchAsync ~ create_payment_json", create_payment_json)
    paypal.payment.create(create_payment_json, async function (error, payment) {
      if (error) {
        console.log("🚀 ~ file: orders.js ~ line 222 ~ error", error)
        console.log("🚀 ~ file: orders.js ~ line 222 ~ error", error.response.details)

        throw error;
      } else {
        console.log("Create Payment Response");
        console.log(payment);
        id=payment.id
        for (let index = 0; index < payment.links.length; index++) {
          const element = payment.links[index];
          
          if (element.rel === "approval_url") {
            res.send({ href: element.href });
            console.log(
              "🚀 ~ file: orders.js ~ line 235 ~ element.href",
              element.href
            );
          }
        }
        console.log(id)
      const PreOrder = new preOrder({
        product: req.body.products,
        totalAmount: req.body.totalAmount,
        orderNumber: id,
        firstName: req.body.Name,
        address: req.body.address,
        phone: req.body.phone,
      });
    const preorder = await PreOrder.save();
    console.log("🚀 ~ file: orders.js ~ line 250 ~ exports.pay=catchAsync ~ preorder", preorder)
  
      }
    })

    
  } catch (error) {
  console.log("🚀 ~ file: orders.js ~ line 248 ~ exports.pay=catchAsync ~ error", error)
    res.send(error)
  }
 
});


exports.orderNoPay = catchAsync(async (req, res, next) => {
  //console.log("first")

  let totalAmount = req.body.totalAmount;

  let Name = req.body.Name;

  let address = req.body.address;

  console.log(req.body);

  let carts;
  let orderNumber;
  try {
    carts = req.body.products;
    console.log("🚀 ~ file: orders.js ~ line 72 ~ carts", carts);
    if (!Name.trim() || !address.trim()) {
      res.status(400);
      res.json({
        error: {
          message: "firstName , lastName , address Required..",
        },
      });
      return;
    }

    const order = new Order({
      product: req.body.products,
      totalAmount: req.body.totalAmount,
      firstName: req.body.Name,
      address: req.body.address,
      phone: req.body.phone,
    });
     const sendedOrder=await order.save();
     res.send(sendedOrder);
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
        message: "Name , address Required..",
      },
    });
    return;
  }

})

exports.callback = catchAsync(async (req, res, next) => {
  try {
    //******************************** */
    const payerId=req.query.PayerID
    console.log("🚀 ~ file: orders.js ~ line 318 ~ exports.callback=catchAsync ~ payerId", payerId)
    const paymentId=req.query.paymentId
    console.log("🚀 ~ file: orders.js ~ line 263 ~ exports.callback=catchAsync ~ paymentId", paymentId)
     
      //** ////////////////////////
        console.log("🚀 ~ file: orders.js ~ line 202 ~ res.body", paymentId)
        const preorder=await preOrder.findOne({orderNumber:paymentId})
        console.log("🚀 ~ file: orders.js ~ line 290 ~ exports.callback=catchAsync ~ preorder", preorder)
        if(!preorder)
        {
         return res.send("no order");
 
        }



        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
              "amount": {
                  "currency": "USD",
                  "total": preorder.totalAmount
              }
          }]
        };
      
        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
          if (error) {
              console.log(error.response);
              res.send(error,payerId)
          } else {
              console.log(JSON.stringify(payment));

              await Order.create({
                product:preorder.product,
                firstName:preorder.firstName,
                address:preorder.address,
                phone:preorder.phone,
                payed:true,
                orderNumber:preorder.orderNumber,
                totalAmount:preorder.totalAmount
            }) 
       
       
            await preOrder.deleteOne({_id:preorder._id})
       
            for (let index = 0; index < preorder.product.length; index++) {
               const element = preorder.product[index];
               await Product.updateOne({_id:element.id},{$inc:{count:element.count}})
               
            } 
            res.redirect(301, `https://www.pure-eg.com/cart/paymentsuccesful`);
          }
      });
   
  } catch (err) {
    res.send({ error: err.toString() });
  }
});



exports.updateOneOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.update({ _id: orderId }, { $set: req.body })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Updated Order Successfully!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

exports.deleteOneOrder = async(req, res, next) => {
  const x= await generateAccessToken()
  console.log("🚀 ~ file: orders.js ~ line 429 ~ exports.deleteOneOrder ~ x", x)
  
  const orderId = req.params.orderId;
  Order.remove({ _id: orderId })
    .exec()
    .then((result) => {
      return res.status(200).json({
        message: "Deleted order!",
        result: result,
      });
    })
    .catch((error) => {
      next(error);
    });
};

/* async function createpreOrder (req, firstName, address,orderNumber) {
console.log("🚀 ~ file: orders.js ~ line 304 ~ createpreOrder ~ req", req.body)
  

let PreOrder =new preOrder({
        _id: mongoose.Types.ObjectId(),
        product:req.body.products,
        user: req.body.userData.userId,
        totalAmount:req.body.totalAmount,
        orderNumber:req.body.orderNumber,
        firstName:req.body.fristName,
        address:
    });
  const preorder= await PreOrder.save()
   return preorder
}
 */

async function getLast30DaysOrdersAmount() {
  let date = new Date();
  date.setMonth(date.getMonth() - 1);
  console.log(date.toDateString());

  return Order.aggregate([
    {
      $match: {
        created_at: {
          $gte: date,
        },
      },
    },
    {
      $group: {
        _id: "",
        totalAmount: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
  ]).then((r) => {
    return r[0].totalAmount;
  });
}

async function getLast30DaysOrderCount() {
  let date = new Date();
  date.setMonth(date.getMonth() - 1);
  console.log(date.toDateString());

  return Order.aggregate([
    {
      $match: {
        created_at: {
          $gte: date,
        },
      },
    },
    {
      $count: "orderCount",
    },
  ]).then((r) => {
    console.log(r);

    return r[0].orderCount;
  });
}
async function getTotalOrdersCount() {
  return Order.aggregate([
    {
      $count: "orderCount",
    },
  ]).then((r) => {
    console.log(r);

    return r[0].orderCount;
  });
}

async function getLast30DaysProductWiseSelling() {
  let date = new Date();
  date.setMonth(date.getMonth() - 1);
  console.log(date.toDateString());
  return Order.aggregate([
    {
      $match: {
        created_at: {
          $gte: date,
        },
      },
    },
    {
      $group: {
        _id: "$product",
        quantity: {
          $sum: "$quantity",
        },
        totalSale: {
          $sum: {
            $multiply: ["$quantity", "$price"],
          },
        },
      },
    },
  ]).then((r) => {
    let o = Array.from(r);
    let arr = [];
    o.forEach((e) => {
      arr.push(
        Product.findOne({ _id: e._id }).then((product) => {
          e.product = product;
          return e;
          // console.log(product);
        })
      );
    });

    return Promise.all(arr);
  });
}

exports.summary = async function (req, res, next) {
  try {
    let result = await _summary();
    res.json({ result });
  } catch (er) {
    next(er);
  }
};

const { getLast30DaysRegisteredUser } = require("../controllers/user");
const { getTotalUserCount } = require("../controllers/user");
const order = require("../models/order");

async function _summary() {
  let pc = await productCount();
  let productWise30DaysSummary = await getLast30DaysProductWiseSelling();
  let totalOrderAmountLast30Days = await getLast30DaysOrdersAmount();
  return {
    last30DaysSummary: {
      userRegistered: await getLast30DaysRegisteredUser(),
      sale: totalOrderAmountLast30Days,
      orders: await getLast30DaysOrderCount(),
      productWise30DaysSummary,
    },
    overAll: {
      products: pc,
      orders: await getTotalOrdersCount(),
      users: await getTotalUserCount(),
    },
  };
}


/* async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
  const response = await axios(`https://paypal.com/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      auth
     // Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}
generateAccessToken().then((access_token) => {
  console.log("🚀 ~ file: orders.js ~ line 581 ~ generateAccessToken ~ access_token", access_token)
return 
	
}) */


 



