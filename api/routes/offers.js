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

const offersController = require('../controllers/offers');

router.get('/',offersController.getAlloffers);

router.post('/', auths.adminAuth,upload.array('productImage'), offersController.createOneoffer);

router.get('/:offerId', offersController.getOneoffer);

router.patch('/:offerId', auths.adminAuth, offersController.updateOneoffer);

router.delete('/:offerId', auths.adminAuth, offersController.deleteOneoffer);

module.exports = router;