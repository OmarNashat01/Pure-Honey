const mongoose = require('mongoose');
var passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const Order = require('../models/order');

const User = require('../models/user');

exports.isAdmin = (req, res, next) => {
    
    if (req.userData.userType == 'admin')
        return res.json(true)
    else
        return res.json(false)
}

exports.isPhone = (req, res, next) => {
    User.find({ phone: req.body.phone })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(200).json({valid: true})
            }
            return res.status(200).json({valid: false})
        })
        .catch((error) => {
            next(error);
        });
}

exports.signUp = (req, res, next) => {
    console.log('hrer')
    User
        .find({ phone: req.body.phone })
        .exec()
        .then(user => {
            if (user.length < 1) {
                console.log(req.body.password)
                return passwordHash.generate(req.body.password);
            }
            const error = new Error();
            error.message = 'User Exists!';
            throw error;
        })
        .then(hash => {
            const user = createUser(req.body.name, req.body.phone, hash,req.body.address);
            return user.save();
        })
        .then(result => {
            console.log('first')
            return res.status(201).json({
                message: 'User created successfully!'
            })
        })
        .catch((error) => {
            next(error);
        });

};

exports.getProfile = (req, res, next) => {

    User
        .findOne({ phone: req.userData.phone })
        .select('_id address userType name phone')
        .exec()
        .then(user => {
            if (user.length < 1) {
                const error = new Error();
                error.message = 'Auth Failed!';
                throw error;
            }
            return user;
        })
        .then(user => {
            if (user) {
                return res.json({ user })
            }
        })
        .catch(error => {
            next(error);
        });
};
exports.getAll = (req, res, next) => {

    User.find()
        .select()
        .exec()
        .then(users => {
            return res.json({ users })
        })
        .catch(error => {
            next(error);
        });
};
exports.updateuser = (req, res, next) => {

    console.log("🚀 ~ file: user.js ~ line 102 ~ address",req.body.address)
    User.updateOne({ phone: req.userData.phone },{address:req.body.address})
        .then(users => {
            return res.json({ users })
        })
        .catch(error => {
            next(error);
        });
};


exports.logIn = (req, res, next) => {
   

    res.cookie("userData", "hy");
    let phone = undefined,
        userId = undefined;
    userType = undefined;
    User
        .find({ phone: req.body.phone })
        .exec()
        .then(user => {
            if (user.length < 1) {
                const error = new Error();
                error.message = 'Auth Failed!';
                throw error;
            }
            phone = user[0].phone;
            userType = user[0].userType;
            userId = user[0]._id;
            return passwordHash.verify(req.body.password, user[0].password);
        })
        .then(result => {
            if (result) {
                const token = jwt.sign({
                        phone: phone,
                        userId: userId,
                        userType
                    },
                    process.env.JWT_KEY, {
                        expiresIn: "168h"
                    }
                );
                console.log("🚀 ~ file: user.js ~ line 140 ~ res.header")
                return res.status(200).json({
                    message: 'Auth Successful!',
                    token: token,
                    userType
                });
            }
            const error = new Error();
            error.message = 'Auth Failed!';
            throw error;
        })
        .catch(error => {
            next(error);
        });
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User
        .remove({ _id: userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted Successfully!'
            });
        })
        .catch(error => {
            error.message = 'Could Not Delete User!';
            next(error);
        });
};

function createUser(name, phone, hash,address) {
    return new User({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        phone: phone,
        password: hash,
        address
    });
}


//
exports.getLast30DaysRegisteredUser = async function() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1)
    console.log(date.toDateString());
    return User.aggregate(
        [{
                $match: {
                    "created_at": {
                        $gte: date,
                    }
                }
            },
            {
                "$count": 'userCount'
            }


        ]
    ).then(r => {
        return r[0].userCount
    })
}

exports.getTotalUserCount = async function() {

    return User.aggregate(
        [{
            "$count": 'userCount'
        }]
    ).then(r => {
        return r[0].userCount
    })
}

