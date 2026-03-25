
const { body, validationResult } = require("express-validator")

/* Inventory form validation rules */
function inventoryRules() {
  return [
    body("inv_make")
      .trim()
      .notEmpty().withMessage("Please enter the vehicle's make")
      .isLength({ max: 50 }).withMessage("Keep the make under 50 characters"),

    body("inv_model")
      .trim()
      .notEmpty().withMessage("What's the vehicle's model?")
      .isLength({ max: 50 }).withMessage("Model should be under 50 characters"),

    body("inv_year")
      .trim()
      .notEmpty().withMessage("What year was the vehicle made?")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Enter a valid year"),

    body("inv_description")
      .trim()
      .notEmpty().withMessage("Tell us about the vehicle")
      .isLength({ max: 500 }).withMessage("Keep the description under 500 characters"),

    body("inv_price")
      .trim()
      .notEmpty().withMessage("What's the vehicle's price?")
      .isFloat({ min: 0 }).withMessage("Price should be a positive number"),

    body("inv_miles")
      .trim()
      .notEmpty().withMessage("How many miles does the vehicle have?")
      .isFloat({ min: 0 }).withMessage("Mileage should be a positive number"),

    body("inv_color")
      .trim()
      .notEmpty().withMessage("What's the vehicle's color?")
      .isLength({ max: 30 }).withMessage("Color should be under 30 characters"),

    body("inv_image")
      .trim()
      .notEmpty().withMessage("Please enter the image path"),

    body("inv_thumbnail")
      .trim()
      .notEmpty().withMessage("Please enter the thumbnail path"),

    body("classification_id")
      .trim()
      .notEmpty().withMessage("Please select a classification"),
  ]
}

/* Classification form validation rules */
function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .notEmpty().withMessage("Please enter a classification name")
      .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed")
  ]
}

/* Check validation results */
function checkData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.errors = errors.array().reduce((acc, err) => {
      acc[err.param] = err
      return acc
    }, {})
    return next()
  }
  req.errors = null
  next()
}

module.exports = {
  inventoryRules,
  classificationRules,
  checkData,
}