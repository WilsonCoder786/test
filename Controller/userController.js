const bcypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { AuthValidator } = require("../Validator/AuthValidate");
const userModel = require("../Model/userModel");

const nodemailer = require("nodemailer");
const { check_missing_fields } = require("../helper/common_function");
const { ProfileValidator } = require("../Validator/ProfileValidate");


//create Account
exports.createUser = async (req, res) => {
    try {

        await AuthValidator.validateAsync(req.body);
        console.log("test")

        const otp = Math.floor(100000 + Math.random() * 900000);

        let checkuser = await userModel.findOne({
            email: req.body.email
        })

        if (checkuser) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }
        else {
            var hashPass = await bcypt.hash(req.body.password, 12)

            const newUser = new userModel({
                name: req.body.name,
                email: req.body.email,
                password: hashPass,
                userType: req.body.userType,
                otp: otp,
            })
            await newUser.save(); // Manually validate the item
            console.log("hello")

            const token = jwt.sign({ userId: newUser._id }, 'user_sckeret', { expiresIn: '1h' });

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "mzhassan444@gmail.com",
                    pass: "ucqbkugmlvklkqgo"
                }
            })

            const info = {
                from: "mzhassan444@gmail.com",
                to: req.body.email,
                subject: "Welcome to Your App - OTP Verification",
                html: `
                    <h1>Main Heading: OTP Verification</h1>
                    <p>Welcome to Your App! Please use the OTP below to verify your account.</p>
                    <p>Your OTP code is: ${otp}</p>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX4dSRdBCz6erQsHv_W3hltQFBIp-hDQF4mg&usqp=CAU" alt="Image Alt Text">
                `,
            };
            transporter.sendMail(info, (err, result) => {
                if (err) {
                    console.log("Error in sending Mail", err);
                }
                else {
                    console.log("Mail sent successfully", info);
                }
            })

            return res.status(200).json({
                message: "Add New User",
                data: newUser,
                token: `Bearer ${token}`
            });
        }
    }
    catch (e) {

        // Handle other types of errors (e.g., server errors)
        return res.status(500).json({
            message: "Internal server error",
            error: e
        });


    }

}


//Verify Otp
exports.verifyOtp = async (req, res) => {

    const { body, headers } = req
    const { authorization } = headers
    const { otp } = body

    console.log(authorization)


    if (!authorization) {
        return res.status(401).json({ message: 'No token provided' });
    }

    else {

        const missing_fields = check_missing_fields(
            ["otp"],
            body
        );

        if (missing_fields.length) {
            res.status(422).json({
                status: 422,
                message: "All fields are required!",
                missing_fields,
            });
            return;
        }
        jwt.verify(authorization, 'user_sckeret', async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Failed to authenticate token' });
            }

            // You can access the user's ID in decoded.userId
            req.userId = decoded.userId;
            console.log(req.userId)

            userFind = await userModel.findById(req.userId)
            console.log(userFind)
            if (userFind.otp == otp) {
                await userFind.updateOne({
                    isVerify: true
                })
            }
            else {
                return res.status(401).json({ message: 'Invalid Otp' });
            }


        });

    }


}

//complete Profile
exports.completeProfile = async (req, res) => {
    try {
        await ProfileValidator.validateAsync(req.body);

    }
    catch (e) {
        return res.status(500).json({
            message: "Internal server error",
            error: e
        });
    }
}

