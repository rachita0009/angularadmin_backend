require('../db/db');
const mongoose = require("mongoose");
const adminschema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        minlength: 3
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
})

const admin = new mongoose.model('admin', adminschema);
module.exports = admin