const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: [{id:{ type: mongoose.Schema.Types.ObjectId, required: true },count:{type:Number,required: true}}],
    firstName: { type: String, require: true },
    address: { type: String, require: true },
    paymentMethod: { type: String, default: "COD" },
    orderNumber:{type: Number},
    totalAmount:{ type: Number,required: true},
    status: {
        type: mongoose.Schema.Types.String,
        default: 'pending'
    }
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Order', orderSchema);