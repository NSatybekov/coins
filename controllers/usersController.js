const { body, validationResult } = require("express-validator");
const User = require('../models/userSchema')
const Transaction = require('../models/transactionSchema')
const passport = require("passport");
const async = require('async')

exports.index = (req,res) => {
    User.find({}, (err, users) => {
        const usersInfo = users.map((user) => [user.username, user.url])
        res.render('users', {users : usersInfo})
    })
} // finding users from database, map method returns usernames


exports.profile = (req,res, next) => {
    User.findById(req.params.id)
        .populate("receivedTransactions").populate({path: "receivedTransactions", populate : {path: "sender"}}) // populating chained data from database to show it to user  (вложенность объектов)
        .populate("sendedTransactions").populate({path: "sendedTransactions", populate : {path: "receiver"}})
            .exec((err, user) => {
                if(err) {return next(err)}
                if(req.user._id.toString() === req.params.id.toString()) {
                    const  urlWithDescription = user.url + '/add_description'
                    res.render('my_profile', { 
                        title: 'Your profile info',
                        name : user.username, 
                        coins: user.coins, 
                        description : user.description, 
                        userUrl: urlWithDescription,
                        receivedTrans : user.receivedTransactions,
                        sendedTrans: user.sendedTransactions,
                        role: user.role
                    })
                }
                else{
                    const urlWithCoins = user.url + '/send_coins'
                    res.render('users_profile', {title: "Other users profile", name: user.username, coins: user.coins, description : user.description, coinUrl: urlWithCoins, role: user.role})
                } // i could make this from users my_profile.ejs - but i dont want to get into details of it
            })
} // need to add method that will check if user is owner of this profile and return another type of data with ability to add description 

exports.addDescriptionGet = (req,res) => {
        res.render('add_desc', {title: 'Edit your profile description'})
}

exports.addDescriptionPost = [
    body("description", "Description is required").trim().isLength({min: 1}).escape(),
            (req,res, next) => {
                const errors = validationResult(req)
                const user = User.findById(req.params.id)
                const userDetails = {
                    username : user.username,
                    coins : user.coins,
                    description : req.body.description,
                    id: user._id
                }
                const updatedUser = new User(userDetails)
                User.findByIdAndUpdate(req.params.id, userDetails, (err, changedUser) => {
                    if(err) {return next(err)}
                    res.redirect(changedUser.url)
                })
            }
]

exports.sendCoinsGet = async (req,res) => {
    const receiver = await User.findById(req.params.id) // async to correctly get data from DB
    const sender = await User.findById(req.user.id) // need to
            if(receiver._id.toString() === sender._id.toString()) {   // we need to make it string because mongoose not correctly compare objectIds
                res.send('You cant do that go back')
            }
    res.render('send_coins', {title: 'Send coins', receiver: receiver.username, sender: sender.username})
}

exports.sendCoinsPost = [
    body("coins", "Coins amount is required").trim().escape(),
    body("message", "Coins amount is required").trim().escape(),
   async (req, res, next) => {
    const errors = validationResult(req)
          const receiver = await User.findById(req.params.id) // async to correctly get data from DB
          const sender = await User.findById(req.user.id)
                    const transaction = await new Transaction({
                        amount : req.body.coins,
                        message: req.body.message,
                        sender: sender,
                        receiver: receiver
                    })
                            if(sender.coins < transaction.amount) {
                                res.send('Hey you havent got enough coins you little scammer')
                            }
                                    if(receiver._id.toString() === sender._id.toString()) {  // i got an error when i tried to match it with - receiver._id == sender._id
                                        res.send('You cant send money to yourself you little scammer')
                                    }
                                            else{
                                                transaction.save((err) => {
                                                    if(err) {return next(err)}
                                                    changeBalanceOfUsers(sender, receiver, transaction, req,res, next)
                                               })
                                                
                                            }
        }
]

async function changeBalanceOfUsers(senderProfile, receiverProfile, transaction, req, res, next) { // принять параметр ресивер и юзер, кол-во коинов и тд
    const senderCoins = await (senderProfile.coins - transaction.amount )
    const receiverCoins = await (receiverProfile.coins + transaction.amount) // в какие моменты лучше использовать await? - знаю что вернет пустой объект если запустить синхронно так как не успеет взять данные


        const updatedSender =  {
            coins: senderCoins,
            $push: {sendedTransactions: transaction}
        }
        const updatedReceiver = {
            coins: receiverCoins,
            $push : {receivedTransactions: transaction} //this method helps to push transaction to array without downloading array to server from mongo
        }   
                    async.series( {
                        // обновление профайлов юзеров 
                        receiver(callback) {
                            User.findByIdAndUpdate(receiverProfile._id , updatedReceiver, callback)
                        }, 
                        sender(callback){
                            User.findByIdAndUpdate(senderProfile._id, updatedSender, callback) // changing data in sender and receiver objects one after another
                        }
                    }, (err, results) => {
                        if(err) {return next(err)}
                        res.redirect(results.receiver.url)
                    }        
                    )
}