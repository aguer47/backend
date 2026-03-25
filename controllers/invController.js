const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Show vehicles by classification */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()

    // Don't crash if no vehicles exist
    const className = data.length > 0 ? data[0].classification_name : "No Vehicles"

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* Show vehicle details */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const data = await invModel.getInventoryById(inv_id)

    if (!data) {
      return next({ status: 404, message: "Sorry, that vehicle could not be found." })
    }

    const detail = utilities.buildVehicleDetail(data)
    const nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: data.inv_make + " " + data.inv_model,
      nav,
      vehicle: data,
      detail,
    })
  } catch (error) {
    next(error)
  }
}

/* Show management page */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* Add new classification */
invCont.addClassification = async function (req, res) {
  try {
    const nav = await utilities.getNav()

    // Check for validation errors
    if (req.errors) {
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: req.errors,
      })
    }

    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
      req.flash("notice", "Classification added successfully.")
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav: await utilities.getNav(), 
      })
    } else {
      req.flash("error", "Failed to add classification.")
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    req.flash("error", "Error adding classification: " + error.message)
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav: await utilities.getNav(),
      errors: [{ msg: error.message }],
    })
  }
}

/* Show add classification form */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null, 
    })
  } catch (error) {
    next(error)
  }
}

/* Show add inventory form */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      inv_make: '',
      inv_model: '',
      inv_description: '',
      inv_price: '',
      inv_year: '',
      inv_miles: '',
      inv_color: '',
      inv_image: '/images/vehicles/no-image.png',
      inv_thumbnail: '/images/vehicles/no-image-tn.png',
    })
  } catch (error) {
    next(error)
  }
}

/* Process add inventory form */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  try {
    
    if (req.errors) {
      const classificationList = await utilities.buildClassificationList(req.body.classification_id)

      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: req.errors,
        ...req.body, 
      })
    }

    const result = await invModel.addInventory(req.body)

    if (result) {
      req.flash("notice", "Vehicle added successfully.")
      return res.redirect("/inv/")
    } else {
      req.flash("error", "Failed to add vehicle.")

      const classificationList = await utilities.buildClassificationList(req.body.classification_id)

      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: [{ msg: "Database insertion failed." }],
        ...req.body,
      })
    }
  } catch (error) {
    req.flash("error", "Error adding vehicle: " + error.message)

    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: [{ msg: error.message }],
      ...req.body,
    })
  }
}


invCont.triggerError = function (req, res, next) {
  throw new Error("Intentional server error")
}

module.exports = invCont