const mongoose = require('mongoose');
const Order = require('../models/order');
const preOrder = require('../models/preorder');

const Product = require('../models/product');
const { productCount } = require('../controllers/products');
const axios = require("axios")


exports.getAllOrders = (req, res, next) => {
    if (req.userData.userType == 'user') {
        console.log(req.userData);
        Order
            .find({ user: req.userData.userId })
            .select()
            .sort("-created_at")
            .populate({
                path: 'product',
                populate: {
                    path: 'category'
                }
            })
            .populate('user')
            .exec()
            .then(orders => {
                return res.status(200).json({
                    count: orders.length,
                    orders: orders
                });
            })
            .catch(error => {
                next(error);
            })
        return
    }

    let o;
    if (req.userData.userType == 'admin' && req.query.all)
        o = Order.find()
    else {
        o = Order
            .find({ user: req.userData.userId })
    }

    o.select()
        .populate({
            path: 'product',
            populate: {
                path: 'category'
            }
        })
        .populate('user')
        .sort("-created_at")
        .exec()
        .then(orders => {
            res.status(200).json({
                count: orders.length,
                orders: orders
            });
        })
        .catch(error => {
            next(error);
        })
};

exports.saveOrders = (req, res, next) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let address = req.body.address;

    console.log(req.body.products);

    let carts
    try {
        carts = req.body.products;
        console.log("🚀 ~ file: orders.js ~ line 72 ~ carts", carts)
        if (!firstName.trim() || !lastName.trim() || !address.trim()) {
            res.status(400)
            res.json({
                error: {
                    message: 'firstName , lastName , address Required..'
                }
            })
            return
        }
    } catch (error) {
        res.status(400)
        if (!carts) {
            res.json({
                error: {
                    message: 'Products Required..'
                }
            })
            return
        }
        res.json({
            error: {
                message: 'firstName , lastName , address Required..'
            }
        })
        return
    }
    console.log('first')
    let orders = [];
    for (let i = 0; i < carts.length; i++) {
        orders.push(createpreOrder(req, carts[i], firstName, lastName, address));
    }


    Order.create(orders)
        .then(orders => {
            return res.status(201).json({
                message: 'Orders were created',
                orders
            });
        })
        .catch(error => {
            next(error);
        });
};

exports.getOneOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .findById(orderId)
        .select()
        .populate('product user')
        .exec()
        .then(order => {
            return res.status(201).json(order);
        })
        .catch(error => {
            next(error);
        });
};

exports.pay = async (req, res2, next) => {

  //console.log("first")

    let totalAmount = req.body.totalAmount;

      let firstName = req.body.firstName
    let address = req.body.address;
   


    console.log(req.body.products);

    let carts
    let orderNumber
    try {
        carts = req.body.products;
        console.log("🚀 ~ file: orders.js ~ line 72 ~ carts", carts)
        if (!firstName.trim()  || !address.trim()) {
            res2.status(400)
            res2.json({
                error: {
                    message: 'firstName , lastName , address Required..'
                }
            })
            return
        }
    } catch (error) {
        res2.status(400)
        if (!carts) {
            res2.json({
                error: {
                    message: 'Products Required..'
                }
            })
            return
        }
        res2.json({
            error: {
                message: 'firstName , lastName , address Required..'
            }
        })
        return
    }
    console.log('first') 


      
    
         //!!  ///////////////////////////////////////////////////////
    //    return res2.json(preoreder) 
         //!! //////////////////////////
         console.log("1")

        const apiT = {
          api_key: "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TWpVMk9UVTNMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuVFFHemNkSEtqdV9rd05xYlo1Ym8tTDAwVzhWTXhIS1JLQVV4SFFUY0ZwSUF2dWdGandUU3Vyc1pDSEdvOUxkVlduTGJ6ZGF2TDNCanNaeXVFdEpLT2c="
        } 
       // return res2.send("i")
          axios.post('https://accept.paymob.com/api/auth/tokens',apiT ).then((res)=>{
       
              
              const amount_cents = (50+totalAmount)*100;
              const items = [{
                name: "عسل",
                amount_cents: 15550000,
                description: 'gg',
                quantity: 2
              }];
              
               /*  Data.map((p) => {  
                const I = 
                  items.push(I);
                }) */
            
                const APITOKEN = res.data.token;
                const orderData = {
                  auth_token: APITOKEN,
                  delivery_needed: true,
                  amount_cents:  amount_cents,
                  currency: "EGP",
                  items: items
                }
                console.log("2")
              //  return res2.json("i")
                axios.post('https://accept.paymob.com/api/ecommerce/orders', orderData).then((res)=>{
           
                      const orderNumber = res.data.id;
                      
        
                      const keyData = {
                          auth_token: APITOKEN,
                          amount_cents: amount_cents , 
                          expiration: 3600, 
                          order_id: orderNumber,
                          "billing_data": {
                            "apartment": "803", 
                            "email": "claudette09@exa.com", 
                            "floor": "42", 
                            "first_name": "Clifford", 
                            "street": "Ethan Land", 
                            "building": "8028", 
                            "phone_number": "+86(8)9135210487", 
                            "shipping_method": "PKG", 
                            "postal_code": "01898", 
                            "city": "Jaskolskiburgh", 
                            "country": "CR", 
                            "last_name": "Nicolas", 
                            "state": "Utah"
                          }, 
                          currency: "EGP", 
                          integration_id: 2492630,
                          
                    }
                    //return res2.send("fuck frist req")
                    console.log("here")
                     axios.post('https://accept.paymob.com/api/acceptance/payment_keys', keyData).then((res5)=> {
                          console.log(res5.data)
                  //  return res2.send("fuck frist req")
                    console.log(res5.data.token)
                    return res2.send({token:res5.data.token})
                        createpreOrder(req, firstName, address,orderNumber).then(()=>{
                            return res2.json({token:res5.data.token}) 
                            //res2.redirect(301, `http://accept.paymob.com/api/acceptance/iframes/439131?payment_token=${res5.data.token}`)
                            //proxy.web(req, res2, { target:`https://accept.paymob.com/api/acceptance/iframes/439131?payment_token=${res5.data.token}`});
                              
                }).catch((err)=>{
                       console.log("🚀 ~ file: orders.js ~ line 258 ~ createpreOrder ~ err", err)
                            
                      //  })

        
                    })
                    })

        
        
          })


})}
exports.callback = async(req, res, next) => {
    try{
           // console.log("🚀 ~ file: orders.js ~ line 202 ~ res.body", res.body)
      const preorder=await preOrder.findOne({orderNumber:res.query.order})
      if(!order){
        throw Error("no oders")
      }
    const order=new Order({
        user:preorder.user,
        product:preorder.product,
        firstName:preorder.firstName,
        lastName:preorder.lastName,
        address:preorder.address,
        quantity:preorder.quantity,
        paymentMethod:preorder.paymentMethod,
        orderNumber:preorder.orderNumber
    })
    await order.save() 

     res.redirect(301,`http://localhost:3000/`);
    }catch (err){
     res.send({err})
    }
};


exports.updateOneOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .update({ _id: orderId }, { $set: req.body })
        .exec()
        .then(result => {
            return res.status(200).json({
                message: 'Updated Order Successfully!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        });
};



exports.deleteOneOrder = (req, res, next) => {
    const orderId = req.params.orderId;
    Order
        .remove({ _id: orderId })
        .exec()
        .then(result => {
            return res.status(200).json({
                message: 'Deleted order!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        });
};


async function createpreOrder (req, firstName, address,orderNumber) {
console.log("🚀 ~ file: orders.js ~ line 304 ~ createpreOrder ~ req", req.body)
  

let PreOrder =new preOrder({
        _id: mongoose.Types.ObjectId(),
        product:req.body.products,
        user: req.body.userData.userId,
        totalAmount:req.body.totalAmount,
        orderNumber,
        firstName,
        address
    });
  const preorder= await PreOrder.save()
   return preorder
}


async function getLast30DaysOrdersAmount() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1)
    console.log(date.toDateString());

    return Order.aggregate(
        [{
            $match: {
                "created_at": {
                    $gte: date,
                }
            }
        },
        {

            '$group': {
                _id: '',
                totalAmount: {
                    '$sum': {
                        "$multiply": ['$price', '$quantity']
                    }
                }
            },
        }
        ]
    ).then(r => {
        return r[0].totalAmount
    })
}


async function getLast30DaysOrderCount() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1)
    console.log(date.toDateString());

    return Order.aggregate(
        [{
            $match: {
                "created_at": {
                    $gte: date,
                }
            }
        },
        {
            "$count": 'orderCount'
        }
        ]
    ).then(r => {
        console.log(r);

        return r[0].orderCount
    })
}
async function getTotalOrdersCount() {
    return Order.aggregate(
        [{
            "$count": 'orderCount'
        }]
    ).then(r => {
        console.log(r);

        return r[0].orderCount
    })
}



async function getLast30DaysProductWiseSelling() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1)
    console.log(date.toDateString());
    return Order.aggregate(
        [{
            $match: {
                "created_at": {
                    $gte: date,
                }
            }
        },
        {

            '$group': {
                _id: '$product',
                quantity: {
                    '$sum': '$quantity'
                },
                totalSale: {
                    '$sum': {
                        '$multiply': ['$quantity', '$price']
                    }
                }
            },
        },


        ]
    ).
        then(r => {
            let o = Array.from(r)
            let arr = [];
            o.forEach(e => {
                arr.push(Product.findOne({ _id: e._id })
                    .then(product => {
                        e.product = product
                        return e
                        // console.log(product);
                    }))
            })

            return Promise.all(arr)

        })
}

exports.summary = async function (req, res, next) {
    try {
        let result = await _summary();
        res.json({ result })
    } catch (er) {
        next(er)
    }
}


const { getLast30DaysRegisteredUser } = require('../controllers/user')
const { getTotalUserCount } = require('../controllers/user');
const order = require('../models/order');

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
        }
    }
}


exports.getmostpopularproduct = async (req, res, next) => {

    products = await Order.aggregate([

        {
            $project: {
                product: 1,
                amount: { $size: "$following" }
            }
        },
        { $sort: { amount: 1 } }

    ])

    return res.status(200).json(products)
}
