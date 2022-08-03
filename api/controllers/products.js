const mongoose = require('mongoose');
const Product = require('../models/product');
const Category = require('../models/category');
const catchAsync = require('../middleware/catchAsync');
const { response } = require('express');
require('dotenv').config();
const cloudinary = require('../middleware/cloudinary')

exports.admingetAllProducts = catchAsync(async (req, res, next) => {
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
    
    console.log("=================================================")
    console.log(req.query.min);
    console.log(filter);
    console.log("=================================================")
    try{
        filter.type=req.query.type
        let prods = await Product.find(filter)
     
        console.log(prods);
        res.status(200).json(sortedProduct);
    }
    catch (error) {
        res
          .status(400)
          .json({ success: false, message: 'No products are found!' });
      }
})


exports.getAllProducts = catchAsync(async (req, res, next) => {

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
    
    console.log("=================================================")
    console.log(req.query.min);
    console.log(filter);
    console.log("=================================================")
    try{
        filter.type=req.query.type
        let prods = await Product.find(filter)
        var sortedProduct = prods.reduce((obj,value) =>{
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
        console.log(sortedProduct);
        res.status(200).json(sortedProduct);
    }
    catch (error) {
        res
          .status(400)
          .json({ success: false, message: 'No products are found!' });
      }

    // let q = await Product.find(filter)
    //     .populate('cat')
    //     //.select('_id name price')
    //     .exec()
    //     .then(products => {
    //         const response = {
    //             count: products.length,
    //             products: products.map(product => {
    //                 return {
    //                     _id: product._id,
    //                     name: product.name,
    //                     price: product.price,
    //                     category: product.category,
    //                     productImage: product.productImage
    //                 }
    //             })
    //         };
    //         res.status(200).json(response);
    //     })
    //     .catch(error => {
    //         next(error);
    //     })
});


exports.createOneProduct =catchAsync( async (req, res, next) => {

   // let temp = await Category.findOne({'name': req.body.category}).select('_id');

    if(1){
        const product = await createProduct(req);
        console.log("=================================================")
        console.log(product);
        console.log("=================================================")

    
        await product.save();
        try {
            res.status(200).json({
                message: 'Product Created Successfully!',
                product
            });
        }
        catch(error){
            next(error);
        }
    }else{
        res.status(400).json({
            message: 'Category not found',
            success: 'false'
        });
    }
});

exports.getOneProduct = (req, res, next) => {
    const id = req.params.productId;
    Product
        .findById(id)
        .select('_id name price productImage category description')
        .populate('cat')
        .exec()
        .then(product => {
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({
                    message: 'Product Not Found!'
                });
            }
        })
        .catch(error => {
            next(error);
        });
};

exports.updateOneProduct = (req, res, next) => {
    const productId = req.params.productId;
    // const updateOps = {};
    // for (const prop of req.body) {
    // 	updateOps[prop.propName] = prop.propValue;
    // }

    Product
        .update({ _id: productId }, { $set: req.body })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Updated Product Successfully!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        })
};

exports.deleteOneProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product
        .remove({ _id: productId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Deleted Product Successfully!',
                result: result
            });
        })
        .catch(error => {
            next(error);
        });
};

const createProduct = async (req)=> {
//======================Cloudinary============================
    const urls = [];
    const files = req.files;
    
    console.log(req.files)
    for (const file of files) {
        const path = file.path;
        const newPath = await cloudinary.uploader.upload(path);
        const newUrl = newPath.secure_url ;
        console.log("🚀 ~ file: products.js ~ line 185 ~ createProduct ~ newUrl", newUrl)
        
        urls.push(newUrl);
        //fs.unlinkSync(path);
    }
    console.log("🚀 ~ file: products.js ~ line 178 ~ createProduct ~ urls", urls)
   
    //===========================================================
    let res = await Product.create({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        type:req.body.type,
        description: req.body.description,
        productImage: urls
    });
    return res

}

exports.mostpopularproduct =catchAsync( async(req, res, next) => {
    try{
        
      const mostpopularproduct=   await Product.find().limit(6).sort({count:-1})
     res.send(mostpopularproduct)
    }catch (err){
res.send({err})
    }
})

exports.productCount = () => {
    return Product.aggregate(
        [{
            "$count": "productCount"
        }]
    ).then(r => {
        return r[0].productCount
    })
}