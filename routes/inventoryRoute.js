
const express = require("express")
const router = new express.Router()


const invCont = require("../controllers/invController")

const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")


router.get("/", utilities.handleErrors(invCont.buildManagement))

// Show vehicles by classification
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId))

// Show vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invCont.buildByInventoryId))

// Add Classification
router.get("/add-classification", utilities.handleErrors(invCont.buildAddClassification))
router.post("/add-classification",
  invValidate.classificationRules(),
  invValidate.checkData,
  utilities.handleErrors(invCont.addClassification)
)

// Add Inventory
router.get("/add-inventory", utilities.handleErrors(invCont.buildAddInventory))
router.post("/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkData,
  utilities.handleErrors(invCont.addInventory)
)

// Route to trigger intentional error (for testing)
router.get("/error", utilities.handleErrors(invCont.triggerError))

module.exports = router