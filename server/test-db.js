require('dotenv').config();
const { Pool } = require('pg');

console.log('Testing database connection...');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
});

async function testConnection() {
    try {
        const result = await pool.query('SELECT current_user, current_database(), version()');
        console.log('✅ Connection successful!');
        console.log('User:', result.rows[0].current_user);
        console.log('Database:', result.rows[0].current_database);
        console.log('Version:', result.rows[0].version);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error code:', error.code);
        console.error('Error detail:', error.detail);
    } finally {
        await pool.end();
    }
}

testConnection();