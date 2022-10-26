const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, maxLength: 15},
    description: {type: String, maxLength: 500 },
    coins: {type: Number, default : 1000},
    hash: String,
    salt: String,
    sendedTransactions: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
    receivedTransactions: [{type: Schema.Types.ObjectId, ref: "Transaction"}], // проблема метода возможная - один и тот же объект сохраняется в 3 местах или лучше в самой транзакции делать линк на юзера
    role: {type: String, default: "user"}
});
UserSchema.virtual("url").get(function () {
    return `/users/${this._id}`;
  });

module.exports = mongoose.model('User', UserSchema)
