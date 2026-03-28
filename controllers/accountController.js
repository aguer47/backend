const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()


const accountController = {}

/* ****************************************
 *  Deliver Register View
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Deliver Login View
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Deliver Account Management View
 * *************************************** */
accountController.buildAccountManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render("account/login", { title: "Login", nav, errors: null })
    } else {
      req.flash("error", "Sorry, the registration failed.")
      return res.status(501).render("account/register", { title: "Register", nav, errors: null })
    }
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  
  console.log('Login attempt:', { account_email, hasPassword: !!account_password })
  
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log('Account data found:', !!accountData)
  
  if (!accountData) {
    console.log('No account found for email:', account_email)
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  
  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    console.log('Password match result:', passwordMatch)
    
    if (passwordMatch) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      console.log('Password comparison failed')
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.log('Login error:', error.message)
    throw new Error('Access Forbidden')
  }
}
accountController.accountLogin = accountLogin

module.exports = accountController