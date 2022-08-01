const express = require('express');
const router = express.Router();
const auth = require('../middleware/check-auth');

const OrdersController = require('../controllers/orders');

router.get('/', auth.userAuth, OrdersController.getAllOrders);
router.post('/', auth.userAuth, OrdersController.saveOrders);
router.post('/', auth.adminAuth, OrdersController.getmostpopularproduct);
router.post('/pay'/* , auth.userAuth */, OrdersController.pay  );
router.post('/c'/* , auth.userAuth */,(req,res)=>{
    res.send("fuck cors")
}  );


router.post('/p'/* , auth.userAuth , */,OrdersController.pay );
router.get('/callback'/* , auth.userAuth */, OrdersController.callback);



router.get('/:orderId', auth.userAuth, OrdersController.getOneOrder);

router.patch('/:orderId', auth.userAuth, OrdersController.updateOneOrder);

router.delete('/:orderId', auth.userAuth, OrdersController.deleteOneOrder);

module.exports = router;