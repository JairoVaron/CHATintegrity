const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    execute: async (query, params) => {
        const result = await pool.query(query, params);
        return [result.rows];
    }
};