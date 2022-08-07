const mongoose = require('mongoose');

const preorderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: [{id:{ type: mongoose.Schema.Types.ObjectId, required: true },count:{type:Number}}],
    firstName: { type: String, require: true },
    address: { type: String, require: true },
    totalQuantity: { type: Number, default: 1 },
    paymentMethod: { type: String, default: "COD" },
    orderNumber:{type: Number},
    totalAmount:{ type: Number,required: true}
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('preorder', preorderSchema);