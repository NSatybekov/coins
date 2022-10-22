var express = require('express');
var router = express.Router();
const passportConfig = require('../config/passport')

const loginController = require('../controllers/loginController')

/* GET home page. */
router.get('/', passportConfig.checkAuthenticated , loginController.index);

router.get('/login', passportConfig.checkNotAuthenticated, loginController.login_get);

router.post('/login',passportConfig.checkNotAuthenticated, loginController.login_post);

router.get('/register', passportConfig.checkNotAuthenticated ,  loginController.register_get);

router.post('/register',passportConfig.checkNotAuthenticated, loginController.register_post);

router.post('/logout', loginController.logout_post)


module.exports = router;

