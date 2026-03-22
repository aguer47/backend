const express = require("express")
const router = new express.Router()

const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Register view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process registration (WITH validation)
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router