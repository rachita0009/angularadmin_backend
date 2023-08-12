require('../db/db');
const mongoose = require("mongoose");


const dataschema = new mongoose.Schema({

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
    },
    activeStatus: {
        type: Number,
        default: 2
    }

})



const data = new mongoose.model('data', dataschema);
module.exports = data