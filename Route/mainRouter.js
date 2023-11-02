const express = require('express');
const router = express.Router();
const userrouter = require('./userRouter.js');


router.use('/user', userrouter);

module.exports = router;