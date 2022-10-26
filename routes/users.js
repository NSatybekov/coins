var express = require('express');
var router = express.Router();
const userController = require('../controllers/usersController')
const passportConfig = require('../config/passport')

/* GET users listing. */
router.get('/', passportConfig.checkAuthenticated, userController.index);

// middleware checks if user authentificated profile owner checks if user own this profile and can do CRUD operations
router.get('/:id/add_description', passportConfig.checkAuthenticated, passportConfig.checkProfileOwner, userController.addDescriptionGet)

router.post('/:id/add_description', passportConfig.checkAuthenticated, passportConfig.checkProfileOwner, userController.addDescriptionPost) 

router.get('/:id/send_coins', passportConfig.checkAuthenticated, userController.sendCoinsGet) // checking if user is trying to send coins to himself not written in middleware

router.post('/:id/send_coins',passportConfig.checkAuthenticated, userController.sendCoinsPost)

router.get('/:id/',passportConfig.checkAuthenticated, userController.profile)



module.exports = router;
