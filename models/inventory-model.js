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
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
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
      INSERT INTO public.classification (classification_name)
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

module.exports = { 
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryById, 
  addClassification, 
  addInventory 
}