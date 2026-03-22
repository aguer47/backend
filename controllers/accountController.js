const utilities = require("../utilities/")
const accountModel = require("../models/account-model")

const accountController = {}

/* ****************************************
 *  Deliver Register View
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver Login View
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {

  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )

    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("error", "Sorry, the registration failed.")

    return res.status(501).render("account/register", {
      title: "Register",
      nav,
    })
  }
}

module.exports = accountController