const pool = require("../database/")

/* Get all classifications */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
    return data.rows
  } catch (error) {
    console.error("getClassifications error: " + error)
    return []
  }
}

/* Get vehicles by classification */
async function getInventoryByClassificationId(classification_id) {
  try {
    console.log('Getting inventory for classification_id:', classification_id)
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM inventory AS i 
       JOIN classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    console.log('Query result:', data.rows)
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
    return []
  }
}

/* Add new classification */
async function addClassification(classification_name) {
  try {
    // Server-side validation: only alphanumeric
    if (!/^[A-Za-z0-9]+$/.test(classification_name)) {
      throw new Error("Invalid classification name. Only letters and numbers allowed.")
    }

    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *
    `
    const result = await pool.query(sql, [classification_name])
    return result.rows[0] || null
  } catch (error) {
    console.error("addClassification error:", error.stack || error)
    return null
  }
}

/* Get single vehicle by ID */
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] || null
  } catch (error) {
    console.error("getInventoryById error: " + error)
    return null
  }
}

/* Add new vehicle item */
async function addInventory({ inv_make, inv_model, classification_id, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail }) {
  try {
    // Basic server-side validation
    if (!inv_make || !inv_model) throw new Error("Make and model are required.")
    if (inv_price < 0) throw new Error("Price must be positive.")
    if (inv_year < 1900 || inv_year > 2099) throw new Error("Year out of range.")
    if (inv_miles < 0) throw new Error("Miles must be positive.")

    const sql = `
      INSERT INTO public.inventory
      (inv_make, inv_model, classification_id, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `
    const result = await pool.query(sql, [inv_make, inv_model, classification_id, inv_description, inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail])
    return result.rows[0] || null
  } catch (error) {
    console.error("addInventory error:", error.stack || error)
    return null
  }
}

/* Delete inventory item */
async function deleteInventory(inv_id) {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE inv_id = $1', [inv_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteInventory error: " + error)
    return false
  }
}

/* Update inventory item */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryById, 
  addClassification, 
  addInventory,
  deleteInventory,
  updateInventory
}