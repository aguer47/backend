
const express = require("express")
const router = new express.Router()


const invCont = require("../controllers/invController")

const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")



router.get("/", utilities.handleErrors(invCont.buildManagement))

// Show vehicles by classification
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId))

// Get inventory items as JSON for AJAX requests
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON))

// Show vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invCont.buildByInventoryId))

router.get("/edit/:inventory_id", utilities.handleErrors(invCont.editInventoryView))

// Delete inventory item confirmation
router.get("/delete/:inventory_id", utilities.handleErrors(invCont.buildDeleteView))

// Process delete inventory item
router.post("/delete", utilities.handleErrors(invCont.deleteInventory))

// Add Classification
router.get("/add-classification", utilities.handleErrors(invCont.buildAddClassification))
router.post("/add-classification",
  invValidate.classificationRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invCont.addClassification)
)

// Add Inventory
router.get("/add-inventory", utilities.handleErrors(invCont.buildAddInventory))
router.post("/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invCont.addInventory)
)

// Route to handle inventory update
router.post(
  "/update/",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invCont.updateInventory)
)

// Route to trigger intentional error (for testing)
router.get("/error", utilities.handleErrors(invCont.triggerError))

module.exports = router