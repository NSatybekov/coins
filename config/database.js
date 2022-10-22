const mongoose = require('mongoose');

require('dotenv').config()

const mongoDB = process.env.DB_URL
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });


const db = mongoose.connection

module.exports = db;