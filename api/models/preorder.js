const mongoose = require('mongoose');

const preorderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: [{id:{ type: mongoose.Schema.Types.ObjectId, required: true },quantity:{type:Number,required: true}}],
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    address: { type: String, require: true },
    totalQuantity: { type: Number, default: 1 },
    paymentMethod: { type: String, default: "COD" },
    orderNumber:{type: Number},

    totalAmount:{ type: Number,required: true}

}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('preorder', preorderSchema);