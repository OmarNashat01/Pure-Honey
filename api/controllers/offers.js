
const mongoose = require('mongoose');
const offers = require('../models/offers');
const Product = require('../models/product');

const Category = require('../models/category');
const catchAsync = require('../middleware/catchAsync');
const { response } = require('express');
require('dotenv').config();
const cloudinary = require('../middleware/cloudinary');
const product = require('../models/product');

exports.getAlloffers = catchAsync(async (req, res, next) => {

    let filter = {
        price: {
            "$lte": 9999999999,
            "$gte": 0
        }
    }
    if (!isNaN(req.query.max)) {
        filter.price["$lte"] = req.query.max
    }
    if (req.query.category) {
        filter.category = req.query.category
    }
    if (!isNaN(req.query.min)) {
        filter.price["$gte"] = req.query.min
    }
    filter.type='offer'

    console.log("=================================================")
    console.log(req.query.min);
    console.log(filter);
    console.log("=================================================")
    try{
        let prods = await Product.find(filter)
        var sortedoffers = prods.reduce((obj,value) =>{
            let key =  value.category;
            if (obj[key] != null){
            
            obj[key].push(value);

            }else{
            obj[key] = [];
            //p.push(key)
            obj[key].push(value);
            }
            
            return obj;
        },{});
        console.log(sortedoffers);
        res.status(200).json(sortedoffers);
    }
    catch (error) {
        res
          .status(400)
          .json({ success: false, message: 'No offerss are found!' });
      }

    // let q = await offers.find(filter)
    //     .populate('cat')
    //     //.select('_id name price')
    //     .exec()
    //     .then(offerss => {
    //         const response = {
    //             count: offerss.length,
    //             offerss: offerss.map(offers => {
    //                 return {
    //                     _id: offers._id,
    //                     name: offers.name,
    //                     price: offers.price,
    //                     category: offers.category,
    //                     offersImage: offers.offersImage
    //                 }
    //             })
    //         };
    //         res.status(200).json(response);
    //     })
    //     .catch(error => {
    //         next(error);
    //     })
});


exports.createOneoffer =catchAsync( async (req, res, next) => {

    //let temp = await Category.findOne({'name': req.body.category}).select('_id');
       console.log("here")
        const offers = await createoffers(req);
        console.log("=================================================")
        console.log(offers);
        console.log("=================================================")

    
        await offers.save();
        try {
            res.status(200).json({
                message: 'offers Created Successfully!',
                offers/* : {
                    _id: offers._id,
                    name: offers.name,
                    category: offers.category,
                    description: offers.description,
                    price: offers.price,
                    offersImage: offers.offersImage
                } */
            });
        }
        catch(error){
            next(error);
        }
   
});

exports.getOneoffer = (req, res, next) => {
    const id = req.params.offerId;
    offers
        .findById(id)
        .select('_id name price productImage category description')
        //.exec()
        .then(offers => {
        console.log("🚀 ~ file: offers.js ~ line 119 ~ offers", offers)
            if (offers) {
                res.status(200).json(offers);
            } else {
                res.status(404).json({
                    message: 'offers Not Found!'
                });
            }
        })
        .catch(error => {
            next(error);
        });
};

exports.updateOneoffer = (req, res, next) => {
    const offersId = req.params.offerId;
    // const updateOps = {};
    // for (const prop of req.body) {
    // 	updateOps[prop.propName] = prop.propValue;
    // }

    offers
        .update({ _id: offersId }, { $set: req.body })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Updated offers Successfully!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        })
};

exports.deleteOneoffer = (req, res, next) => {
    const offersId = req.params.offerId;
    product
        .remove({ _id: offersId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Deleted offers Successfully!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        });
};

const createoffers = async (req)=> {
//======================Cloudinary============================
console.log('174')
    
    const urls = [];
    const files = req.files;
    
    console.log(req.files)
    for (const file of files) {
        const path = file.path;
        const newPath = await cloudinary.uploader.upload(path);
        const newUrl = newPath.secure_url ;
        urls.push(newUrl);
        //fs.unlinkSync(path);
    }

    console.log('184')
    //===========================================================
    let res = await product.create({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        type:'offer',
        category: req.body.category,
        description: req.body.description,
        productImage: urls
    });
    console.log("🚀 ~ file: offers.js ~ line 193 ~ createoffers ~ res", res)
    return res

}


exports.offersCount = () => {
    return offers.aggregate(
        [{
            "$count": "offersCount"
        }]
    ).then(r => {
        return r[0].offersCount
    })
}