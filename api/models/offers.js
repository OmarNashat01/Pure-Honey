const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    productImage: [{ type: String }],
    description: {type: String},
    category: { type: String, required: false },
    cat: { type: String}
});

module.exports = mongoose.model('offers', offerSchema);