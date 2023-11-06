const express = require('express');
const router = express.Router();
const userController = require('../Controller/userController');


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, 'media-' + uniqueSuffix + '.' + ext);
    },
});

const upload = multer({ storage: storage });



router.post('/regsister', userController.createUser);
router.post('/verify-otp', userController.verifyOtp);
router.post('/complete-profile', upload.single('profileImage'), userController.completeProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/change-password', userController.PasswordOtpVerify);



module.exports = router;