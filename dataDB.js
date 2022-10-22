const User = require('./models/userSchema')
const db = require('./config/database')
db.on("error", console.error.bind(console, "MongoDB connection error:"));




function createUser(name, pass) {
    const user = new User({
        username: name,
        password: pass
    })
    user.save((err) => {
        if(err) {return next(err)}
    })
    console.log('User saved')
}

createUser('Beknaza', '2345')

// refactor to hash and Bcrypt
