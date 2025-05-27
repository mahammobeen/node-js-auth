const express = require('express')
const {registerUser, loginUser, changePassword} = require('../controllers/auth')
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware')
// all routes are related to path authentication and authorization

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/change-password',authMiddleware, changePassword)

module.exports = router;