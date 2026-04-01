const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()



const accountController = {}
const favoriteModel = require("../models/favoriteModel")

/* Add favorite */
accountController.addFavorite = async function (req, res, next) {
  try {
    const { inv_id } = req.body
    const account_id = res.locals.accountData.account_id

    await favoriteModel.addFavorite(account_id, inv_id)

    res.redirect("/account/favorites")
  } catch (error) {
    next(error)
  }
}

/* Show favorites */
accountController.buildFavorites = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id

    const data = await favoriteModel.getFavoritesByAccount(account_id)

    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites: data.rows,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}

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



accountController.buildAccountUpdate = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData
    })
  } catch (error) {
    next(error)
  }
}

accountController.updateAccount = async function (req, res, next) {
  try {
    const { account_id, firstname, lastname, email } = req.body
    
    const updateResult = await accountModel.updateAccount(account_id, firstname, lastname, email)
    
    if (updateResult) {
      req.flash("notice", "Account information updated successfully.")
      
      const updatedAccount = await accountModel.getAccountById(account_id)
      
      const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("account/update-account", {
        title: "Update Account",
        nav: await utilities.getNav(),
        errors: null,
        accountData: res.locals.accountData,
        firstname,
        lastname,
        email
      })
    }
  } catch (error) {
    req.flash("notice", "Error updating account: " + error.message)
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: [{ msg: error.message }],
      accountData: res.locals.accountData,
      ...req.body
    })
  }
}

accountController.changePassword = async function (req, res, next) {
  try {
    const { account_id, new_password } = req.body
    
    const hashedPassword = await bcrypt.hash(new_password, 10)
    
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
    
    if (updateResult) {
      req.flash("notice", "Password changed successfully.")
      res.redirect("/account/")
    } else {
      req.flash("notice", "Sorry, the password change failed.")
      res.status(501).render("account/update-account", {
        title: "Update Account",
        nav: await utilities.getNav(),
        errors: null,
        accountData: res.locals.accountData
      })
    }
  } catch (error) {
    req.flash("notice", "Error changing password: " + error.message)
    res.status(500).render("account/update-account", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: [{ msg: error.message }],
      accountData: res.locals.accountData
    })
  }
}

accountController.logout = async function (req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    res.redirect("/")
  } catch (error) {
    next(error)
  }
}

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

accountController.buildAccountManagement = async function (req, res, next) {
  try {
    console.log('Account management - loggedin:', res.locals.loggedin)
    console.log('Account management - accountData:', res.locals.accountData)
    
    let nav = await utilities.getNav()
    console.log('Account management - nav generated')
    
    console.log('About to render account/management view')
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData: res.locals.accountData
    })
    console.log('Account management - view rendered')
  } catch (error) {
    console.log('Account management error:', error.message)
    next(error)
  }
}

accountController.registerAccount = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

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