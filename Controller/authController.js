const bcypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const { AuthValidator } = require("../Validator/AuthValidate");
const userModel = require("../Model/userModel");

const nodemailer = require("nodemailer");
const { check_missing_fields } = require("../helper/common_function");
const { ProfileValidator } = require("../Validator/ProfileValidate");
const profileModel = require("../Model/profileModel");
const { TicketValidator, validateTicket } = require("../Validator/TicketValidate");
const ticketModel = require("../Model/ticketModel");
const { validateLogin } = require("../Validator/userValidate");
const { TokenGenerate } = require("../constant/user");
const constantFunc = require("../constant/user")

const seckret_key = process.env.seckret_key;


const otpStorage = {};


//create Account
exports.createUser = async (req, res) => {
    try {

        await AuthValidator.validateAsync(req.body);

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


            const token = jwt.sign({ userId: newUser._id }, seckret_key, { expiresIn: '1h' });

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
                    // console.log("Mail sent successfully", info);
                }
            })

            return res.status(200).json({
                message: "Add New User",
                data: newUser,
                token: `${token}`
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

                const newToken = jwt.sign({ userId: req.userId }, 'user_sckeret', {
                    expiresIn: '1h' // Token validity duration (change as needed)
                });



                return res.status(200).json({ message: 'Verify OTP successfully', token: newToken });


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

        const { body, headers } = req
        const { authorization } = headers
        console.log(authorization)


        await ProfileValidator.validateAsync(body);

        jwt.verify(authorization, 'user_sckeret', async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Failed to authenticate token' });
            }

            // You can access the user's ID in decoded.userId
            req.userId = decoded.userId;
            console.log(req.userId)

            if (req.file == undefined) {

                return res.status(401).json({ message: 'Select Profile Pic' });
            }


            const Complete_Profile = new profileModel({
                firstName: body.firstName,
                lastName: body.lastName,
                dateOfBirth: body.dateOfBirth,
                gender: body.gender,
                profileImage: req.file.path

            })

            var profiledata = await Complete_Profile.save(body)



            await userModel.findByIdAndUpdate(req.userId, {
                isCompleteProfile: true,
                profileId: profiledata._id
            })


        })

        return res.status(200).json({
            message: "USER COMPLETED PROFILE SUCCESSFULLY",

        });
    }
    catch (e) {
        return res.status(500).json({
            message: "Internal server error",
            error: e
        });
    }
}

//Forgot Password Api
exports.forgotPassword = async (req, res) => {

    const { email } = req.body;

    if (email) {

        let ckeckUser = await userModel.findOne({ email })
        if (ckeckUser == null) {
            return res.status(401).json({ message: ' Invalid Email Address' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 15);
        otpStorage[email] = { otp, expiration: otpExpiration };
        console.log(otpStorage[email])

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "mzhassan444@gmail.com",
                pass: "ucqbkugmlvklkqgo"
            }
        })

        const info = {
            from: "mzhassan444@gmail.com",
            to: email,
            subject: "Welcome to Your App - Forgot Password Otp Verification",
            html: `
                <h1>Forgot Password Otp Verification</h1>
                <p>Welcome to Your App! Please use the OTP below to verify your Forgot Password Otp Verification.</p>
                <p>Your OTP code is: ${otp}</p>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX4dSRdBCz6erQsHv_W3hltQFBIp-hDQF4mg&usqp=CAU" alt="Image Alt Text">
            `,
        };
        transporter.sendMail(info, (err, result) => {
            if (err) {
                // console.log("Error in sending Mail", err);
                return res.status(401).json({ message: 'Error in sending Mail' });

            }
            else {
                // console.log("Mail sent successfully", info);
                return res.status(200).json({ message: 'Otp Send On Email' });
            }
        })

    }
    else {
        return res.status(401).json({ message: 'Enter Email Address' });
    }


}


exports.PasswordOtpVerify = async (req, res) => {
    const { email, otp, newPassword } = req.body;


    if (otpStorage[email] && otpStorage[email].otp === otp && new Date() < new Date(otpStorage[email].expiration)) {

        const User = require('../Model/userModel'); 

        User.findOne({ email: email }, (err, user) => {
            if (err || !user) {
                res.status(401).json({ message: 'User not found' });
            } else {
                user.setPassword(newPassword, (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Failed to update password' });
                    } else {
                        res.json({ message: 'Password updated successfully' });
                    }
                });
            }
        });
    } else {
        res.status(401).json({ message: 'Invalid OTP' });
    }
}

exports.login = async (req, res) => {

    const validationResult = validateLogin(req.body);
    const { email, password } = req.body
    console.log(seckret_key)

    if (validationResult) {
        console.error('Validation error:', validationResult.message);
        return res.json({ message: validationResult.message });

    }
    else {
        let user = await userModel.findOne({ email });

        if (user != null) {

            const isPasswordValid = await bcypt.compare(password, user.password);

            if (isPasswordValid) {
                if (user.isVerify) {
                    if (user.isCompleteProfile) {
                        const profile = await profileModel.findById(user.profileId);
                        user.profileId = profile

                        return res.status(200).json({ message: "User Login SuccessFully", data: user, token });

                    }
                    else {
                        return res.status(200).json({ message: "Plz Compelete Your Profile", data: user });
                    }

                }
                else {
                    return res.status(200).json({ message: "Plz Verify Your Account", data: user });
                }
            }
            else {
                return res.status(401).json({ message: "Password Incorrect" });
            }
        }
        else {
            console.log("innoi")
            return res.status(404).json({ message: "Email Not Regsister" });
        }

    }

}


