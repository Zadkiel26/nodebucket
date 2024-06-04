/**
 * Title: employee-route.js
 * Author: Zadkiel Rodriguez Alvarado
 * Date: 6/3/2024
 * Description: Employee routes
 */
"use strict";

// Imports
const express = require("express");
const router = express.Router();
const { mongo } = require("../utils/mongo");
const createServer = require('http-errors');

// Routes
// Get employee by ID
// Base: http://localhost:3000/api/employees/:empId
// Valid: http://localhost:3000/api/employees/1007

// Invalid: http://localhost:3000/api/employees/foo
// Invalid: http://localhost:3000/api/employees/1000

router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Validate input is a number
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createServer(400, "Input must be a number"));
    }

    // Database query
    mongo(async db => {
      const employees = await db.collection("employees").findOne({ empId });
      if (!employees) {
        console.error("Employee not found", empId);
        return next(createServer(404, "Employee not found"));
      }
      // Send response to client
      res.send(employees);
    }, next);
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

module.exports = router;