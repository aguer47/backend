/* ******************************************
 * This is the application server
 * ******************************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const cookieParser = require("cookie-parser")

const app = express()

const utilities = require("./utilities/") 

const accountRoute = require("./routes/accountRoute")

app.use(express.static("public"))

app.use(express.urlencoded({ extended: true }))

// Set view engine
app.set("view engine", "ejs")

// Set views folder
app.set("views", "./views")

// Use layouts
app.use(expressLayouts)

// Tell Express where the layout file is
app.set("layout", "./layouts/layout")

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
 }))
app.use(cookieParser())
 
app.use(utilities.checkJWTToken)

 // Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ******************************************
 * Default GET route
 * ******************************************/
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

app.use("/account", accountRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})



/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  // Don't try to get nav if there's a database error
  let nav = '<nav><ul><li><a href="/">Home</a></li></ul></nav>'
  
  try {
    nav = await utilities.getNav()
  } catch (navError) {
    // Use basic nav if database is down
    console.log('Database down, using basic navigation')
  }
  
  let message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?'
  
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ******************************************
 * Server host name and port
 * ******************************************/
const PORT = process.env.PORT || 3000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})