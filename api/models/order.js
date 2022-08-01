const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    address: { type: String, require: true },
    quantity: { type: Number, default: 1 },
    paymentMethod: { type: String, default: "COD" },
    orderNumber:{type: Number},
    status: {
        type: mongoose.Schema.Types.String,
        default: 'pending'
    }
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Order', orderSchema);