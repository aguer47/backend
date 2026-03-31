const pool = require('./database/');
const bcrypt = require('bcryptjs');

async function createEmployeeAccount() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const sql = 'INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await pool.query(sql, ['Test', 'Employee', 'employee@test.com', hashedPassword, 'Employee']);
    console.log('Employee account created successfully:');
    console.log('Email: employee@test.com');
    console.log('Password: password123');
    console.log('Type: Employee');
    console.log('Account details:', result.rows[0]);
  } catch (error) {
    console.log('Account might already exist or error:', error.message);
  }
  process.exit(0);
}

createEmployeeAccount();
