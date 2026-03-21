/* ******************************************
 * This is the application server
 * ******************************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")

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
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
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