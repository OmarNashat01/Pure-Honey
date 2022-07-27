const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        userType: {
            type: mongoose.Schema.Types.String,
            default: "user"
        },
        name: {
            type: String,
            require: true,
            unique: false,
        },
        phone: {
            type: String,
            require: true,
            unique: false,
        },
        address: {
            type: String,
            required: true,
            
        },
        password: { type: String, required: true }
    }, { timestamps: { createdAt: 'created_at' } }

);

module.exports = mongoose.model('User', userSchema);