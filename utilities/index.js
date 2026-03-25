const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()

  // handle BOTH cases safely
  let rows = data.rows || data || []

  let list = "<nav><ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'

  rows.forEach((row) => {
    list += "<li>"
    list += `<a href="/inv/type/${row.classification_id}" 
               title="See our inventory of ${row.classification_name} vehicles">
               ${row.classification_name}</a>`
    list += "</li>"
  })

  list += "</ul></nav>"
  return list
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ''
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" 
                 title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                 <img src="${vehicle.inv_thumbnail}" 
                 alt="Thumbnail of ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}" /></a>`
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" 
                 title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                 ${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ***************************
 * Build classification dropdown
 ***************************** */
Util.buildClassificationList = async function (selectedId = null) {
  const data = await invModel.getClassifications()

  let list = '<select name="classification_id" id="classificationList" required>'
  list += '<option value="">Choose a Classification</option>'

  data.forEach(row => {
    list += `<option value="${row.classification_id}"`

    if (selectedId && selectedId == row.classification_id) {
      list += " selected"
    }

    list += `>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}

Util.buildVehicleDetail = function (data) {
  return `
  <div class="vehicle-detail">

    <div class="vehicle-image">
      <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
    </div>

    <div class="vehicle-info">
      <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>

      <p class="price"><strong>Price:</strong> ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(data.inv_price)}</p>

      <p class="mileage"><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(
        data.inv_miles
      )} miles</p>

      <p class="description"><strong>Description:</strong> ${data.inv_description}</p>

      <p class="details"><strong>Color:</strong> ${data.inv_color}</p>
      <p class="details"><strong>Body Style:</strong> ${data.inv_body_style || 'Unknown'}</p>

    </div>

  </div>
  `
}

module.exports = Util