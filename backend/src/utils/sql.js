const pool = require('../config/db')

class SQLProcedureError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'SQLProcedureError'
    this.status = status
  }
}

/**
 * callProc - call a stored procedure and normalize mysql2 CALL result shapes.
 * @param {string} procName - stored procedure name (e.g. 'sp_login_user')
 * @param {Array} params - ordered params array
 * @returns {Promise<any>} - normalized result (object, array, or null)
 * Throws SQLProcedureError for SQL SIGNALS or sql errors.
 */
async function callProc(procName, params = []){
  try{
    const placeholders = params.map(()=>'?').join(', ')
    const sql = `CALL ${procName}(${placeholders})`
    const [rows] = await pool.query(sql, params)

    if (!rows) return null

    // Typical shapes from mysql2 for CALL:
    // 1) rows = [ [ { ... } ], [meta] ] -> rows[0] is resultset array
    // 2) rows = [ [ {a:1}, {a:2} ], [ {something} ] ] -> rows[0] array
    // 3) rows = some array of objects
    if (Array.isArray(rows)){
      const first = rows[0]
      if (Array.isArray(first)){
        // If single row expected, return the object
        if (first.length === 1) return first[0]
        return first
      }
      // rows is an array but first element not array -> return rows
      return rows
    }

    return rows
  }catch(err){
    // Convert SQL errors to a structured error so middleware can map to HTTP
    const message = err?.sqlMessage || err?.message || 'Database error'
    throw new SQLProcedureError(message, 400)
  }
}

module.exports = { callProc, SQLProcedureError }
