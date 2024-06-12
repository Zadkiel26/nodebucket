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
const createError = require('http-errors');
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');

const ajv = new Ajv(); // create an instance of the ajv npm package

// Routes

// Get employee by ID
// Base: http://localhost:3000/api/employees/:empId
// Valid: http://localhost:3000/api/employees/1007

// Invalid: http://localhost:3000/api/employees/foo
// Invalid: http://localhost:3000/api/employees/1000

/**
 * findEmployeeById 
 * @openapi
 * /api/employees/{empId}:
 *   get:
 *     tags:
 *       - employees
 *     description: API for returning a single employee object from MongoDB
 *     summary: Retrieves an employee by ID.
 *     parameters:
 *       - name: empId
 *         in: path
 *         description: The empId requested by the user. 
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Employee document in JSON format
 *       "400":
 *         description: Wrong input
 *       "404":
 *         description: Employee not found with empId
 *       "500":
 *         description: Server exception
 *       "501":
 *         description: Mongo exception
*/
router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Validate empId is a number
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call our mongo and return the employee with the matching empId
    mongo(async db => {
      const employees = await db.collection("employees").findOne({ empId });
      if (!employees) {
        console.error("Employee not found", empId);
        return next(createError(404, "Employee not found"));
      }
      // Send response to client
      res.send(employees);
    }, next);
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

// Get all employee tasks
/**
 * findAllTaskById 
 * @openapi
 * /api/employees/{empId}/tasks:
 *   get:
 *     tags:
 *       - employees
 *     description: API for returning all tasks from an employee
 *     summary: Retrieves all tasks from an employee.
 *     parameters:
 *       - name: empId
 *         in: path
 *         description: The empId requested by the user. 
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Employee Document in JSON format
 *       "400":
 *         description: Wrong input
 *       "404":
 *         description: Employee does not have any tasks
 *       "500":
 *         description: Server exception
 *       "501":
 *         description: Mongo exception
*/
router.get('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Validate empId is a number or NaN
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call out mongo and return the employee's tasks with the matching empId
    mongo(async db => {
      const employee = await db.collection("employees").findOne({ empId: empId }, { projection: { empId: 1, todo: 1, done: 1 } });

      // Check if the employee has tasks
      if (!employee || (!employee.todo && !employee.done)) {
        console.error("Employee has no tasks");
        return next(createError(404, "Employee has no tasks"));
      }
      // Send response to client
      res.send(employee);

    }, next);

  } catch (err) {
    console.log("Error: ", err);
    next(err);
  }
});

// Create a task

// Task schema
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: "string" }
  },
  required: ['text'],
  additionalProperties: false
}

/**
 * createTask
 * @openapi
 * /api/employees/{empId}/tasks:
 *   post:
 *     tags:
 *       - employees
 *     description: API for adding new tasks to todo
 *     summary: Create a new task.
 *     parameters:
 *       - name: empId
 *         in: path
 *         description: The empId requested by the user. 
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Task's information
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Task created successfully
 *       "400":
 *         description: Wrong input / Invalid Task Payload
 *       "404":
 *         description: Employee not found with empId
 *       "500":
 *         description: Server exception
 *       "501":
 *         description: Mongo exception
*/
router.post('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Validate empId is a number or NaN
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call to mongo and insert a new tasks
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      if(!employee) {
        console.log("Employee not found.");
        return next(createError(404, "Employee not found with empId", empId));
      }

      const validator = ajv.compile(taskSchema);
      const valid = validator( req.body );

      // If the payload is not valid return a 400 error and append the errors to the err.errors property
      if(!valid) {
        return next(createError(400, 'Invalid task payload', validator.errors));
      }

      // Create the new task
      const newTask = {
        _id : new ObjectId(),
        text: req.body.text
      };

      // Call the mongo module and update the employee collections with the new task in the todo column
      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $push: { todo: newTask }}
      )

      // Check to see if the modified count is updated; if so then the task was added to the employee field.
      if(!result.modifiedCount) {
        return next(createError(400, 'Unable to create task'));
      }

      res.status(201).send({ id: newTask._id });

    }, next);

  } catch (err) {
    console.log("Error: ", err);
    next(err);
  }
});

module.exports = router;