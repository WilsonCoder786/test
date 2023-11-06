
const Joi = require('joi');

const AuthValidator = Joi.object({

  email: Joi.string().trim().required().email().messages({
    'string.base': `Email must be a string`,
    'string.empty': `Email cannot be empty`,
    'string.email': `Email must be a valid email address`,
    'any.required': `Email is required`,
  }),
  name: Joi.string().trim().required().min(8).max(255).messages({
    'string.base': `Name must be a string`,
    'string.empty': `Name cannot be empty`,
    'string.min': `Name should have a minimum length of {#limit}`,
    'string.max': `Name should have a maximum length of {#limit}`,
    'any.required': `Name is required`,
  }),
  password: Joi.string().required().messages({
    'number.base': `Password must be a string`,
    'number.empty': `Password cannot be empty`,
    'any.required': `Password is required`,
  }),
  userType: Joi.string().valid('admin', 'user').required().messages({
    'string.base': 'User Type must be a string',
    'string.empty': 'User Type cannot be empty',
    'any.only': 'User Type must be one of "admin", "user", or "guest"',
  })

  // image: Joi.object({
  //   fieldname: Joi.string().valid('image').required(),
  //   originalname: Joi.string().required(),
  //   encoding: Joi.string().required(),
  //   mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/gif').required(),
  //   destination: Joi.string().required(),
  //   filename: Joi.string().required(),
  //   path: Joi.string().required(),
  //   size: Joi.number().integer().min(1).required(),
  // }).required().messages({
  //   'object.base': `Profile Image must be an object`,
  //   'any.required': `Profile Image is required`,
  //   'string.valid': `Invalid fieldname for Profile Image`,
  //   'string.empty': `Fieldname for media cannot be empty`,
  //   'string.valid': `Invalid mimetype for media`,
  // }),
});

module.exports = { AuthValidator }