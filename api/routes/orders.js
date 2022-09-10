const express = require('express');
const router = express.Router();
const auth = require('../middleware/check-auth');
const PreOrder= require('../models/preorder')
const Order= require('../models/order')

const OrdersController = require('../controllers/orders');
const paypal= require('../controllers/paypal')
router.get('/', auth.userAuth, OrdersController.getAllOrders);
router.post('/', auth.userAuth, OrdersController.saveOrders);
router.post('/pay'/* , auth.userAuth */, OrdersController.pay  );
router.post('/c'/* , auth.userAuth */, OrdersController.pay  );
router.post('/orderNoPay'/* , auth.userAuth */, OrdersController.orderNoPay  );


router.post('/p'/* , auth.userAuth , */,OrdersController.pay );
router.get('/callback'/* , auth.userAuth */, OrdersController.callback);


router.get('/:orderId', auth.userAuth, OrdersController.getOneOrder);

router.patch('/:orderId', auth.userAuth, OrdersController.updateOneOrder);

router.delete('/:orderId', auth.userAuth, OrdersController.deleteOneOrder);

router.post("/paypal", paypal.pay);
  
  router.post("/:orderId/capture", async (req, res) => {

  try{

    const { orderId } = req.params;
    
    const captureData = await paypal.capturePayment(orderId);
    console.log("🚀 ~ file: orders.js ~ line 33 ~ router.post ~ captureData", captureData)
    if(captureData.status!='COMPLETED'){
      throw Error("not completed")
 }
    
    const preorder=await PreOrder.findOne({orderNumber:orderId})


    await Order.create({
      product:preorder.product,
      firstName:preorder.firstName,
      address:preorder.address,
      phone:preorder.phone,
      payed:true,
      orderNumber:preorder.orderNumber,
      totalAmount:preorder.totalAmount
  }) 
    res.json(captureData);
  } catch(err){
  console.log("🚀 ~ file: orders.js ~ line 41 ~ router.post ~ err", err.toString())

    res.json({error: err.message});

  }
  
  });


module.exports = router;