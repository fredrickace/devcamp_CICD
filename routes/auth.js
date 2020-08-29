const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateDetails,
    updatePassword
} = require('../controllers/auth');
const {protect} = require('../middleware/auth');

const router = express.Router();

router
    .route('/register')
    .post(register);

router
    .route('/login')
    .post(login);

router.route('/me')
    .get(protect, getMe);

router.route('/forgotpassword')
    .post(forgotPassword);

router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

router.put('/resetpassword/:resettoken', resetPassword);
module.exports = router;
