const express = require('express');
const router = express.Router();
const multer = require('multer');

const auths = require('../middleware/check-auth');

const storage = multer.diskStorage({
  
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.imagetype === 'image/png') {
//         cb(null, true);
//     }
//     else {
//         cb(null, false);
//     }
// };

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
    // fileFilter: fileFilter
});

const ProductsController = require('../controllers/products');
router.get('/mostpopularproduct' , ProductsController.mostpopularproduct  );

router.get('/',ProductsController.getAllProducts);
router.get('/admin',auths.adminAuth,ProductsController.admingetAllProducts);


router.post('/', auths.adminAuth,upload.array('productImage'), ProductsController.createOneProduct);

router.get('/:productId', ProductsController.getOneProduct);

router.patch('/:productId', auths.adminAuth,upload.array('productImage'), ProductsController.updateOneProduct);

router.delete('/:productId', auths.adminAuth, ProductsController.deleteOneProduct);

module.exports = router;