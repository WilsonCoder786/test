const express = require('express');
const router = express.Router();
const userController = require('../Controller/userController');

router.post('/regsister',userController.createUser );
router.post('/verify-otp',userController.verifyOtp );


router.post('/complete-profile',userController.completeProfile);

module.exports = router;