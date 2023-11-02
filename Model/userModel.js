
// models/item.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userType:{
        type:String,
        required:true
    },
    isVerify:{
        type :  Boolean,
        default : false
    },
    otp:{
        type:Number,
        default:0
    }


});

module.exports = mongoose.model('user', userSchema);
