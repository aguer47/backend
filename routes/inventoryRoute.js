
const express = require("express")
const router = new express.Router()


const invCont = require("../controllers/invController")

const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")



router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildManagement))

// Show vehicles by classification
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId))

// Get inventory items as JSON for AJAX requests
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON))

// Show vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invCont.buildByInventoryId))

router.get("/edit/:inventory_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.editInventoryView))

// Delete inventory item confirmation
router.get("/delete/:inventory_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildDeleteView))

// Process delete inventory item
router.post("/delete", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.deleteInventory))

// Add Classification
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildAddClassification))
router.post("/add-classification",
  utilities.checkEmployeeOrAdmin,
  invValidate.classificationRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invCont.addClassification)
)

// Add Inventory
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invCont.buildAddInventory))
router.post("/add-inventory",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invCont.addInventory)
)

// Route to handle inventory update
router.post(
  "/update/",
  utilities.checkEmployeeOrAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invCont.updateInventory)
)

// Route to trigger intentional error (for testing)
router.get("/error", utilities.handleErrors(invCont.triggerError))

module.exports = router