const { body, validationResult } = require("express-validator")
const utilities = require("./index") // make sure this path is correct

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

/* Check data for ADD inventory */
async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()

    return res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      ...req.body
    })
  }
  next()
}

/* Check data for UPDATE inventory */
async function checkUpdateData(req, res, next) {
  const errors = validationResult(req)

  const {
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    inv_image,
    inv_thumbnail,
    classification_id,
    inv_id
  } = req.body

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    return res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      classificationList,
      errors,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id
    })
  }
  next()
}

module.exports = {
  inventoryRules,
  classificationRules,
  checkInventoryData,
  checkUpdateData
}