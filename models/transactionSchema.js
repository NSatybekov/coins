const mongoose = require('mongoose')

const Schema = mongoose.Schema

const transactionSchema = new Schema({
    amount: {type: Number, required: true, default: 0},
    message: {type: String, maxLength: 100},
    sender: {type: Schema.Types.ObjectId, ref: "User"}, // this methods allows to get data about user and get all the data about him
    receiver: {type: Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('Transaction', transactionSchema)