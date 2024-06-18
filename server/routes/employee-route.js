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
    // Get the employee Id from the parameter passed in
    let { empId } = req.params;

    // Make sure the empId is a number; it will return NaN if is not a number
    empId = parseInt(empId, 10);

    // Validate empId is a number
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call our mongo and return the employee with the matching empId
    mongo(async db => {
      // Find the employee with the empId
      const employees = await db.collection("employees").findOne({ empId });
      // Check if the employee exists; then return an error if it doesn't
      if (!employees) {
        console.error("Employee not found", empId);
        return next(createError(404, `Employee not found with empId ${empId}`));
      }
      // Send response to client
      res.send(employees);
    }, next);

    // Catch any database errors
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
    // Get the empId from the parameter passed in
    let { empId } = req.params;

    // Make sure the empId is a number; it will return NaN if is not a number
    empId = parseInt(empId, 10);

    // Validate empId is a number or NaN
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call out mongo and return the employee's tasks with the matching empId
    mongo(async db => {
      // Find the employee with the empId; then return the empId, todo array and done array
      const employee = await db.collection("employees").findOne({ empId: empId }, { projection: { empId: 1, todo: 1, done: 1 } });

      // Check if the employee exists; then return an error
      if (!employee) {
        console.error("Employee not found.");
        return next(createError(404, `Employee not found with empId: ${empId}`));
      }
      // Send response to client
      res.send(employee);

    }, next);

    // Catch any database errors
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

// Create a task

// Single task schema
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
 *         description: Wrong input / Invalid Task Payload / Unable to Create Task
 *       "404":
 *         description: Employee not found with empId
 *       "500":
 *         description: Server exception
 *       "501":
 *         description: Mongo exception
*/
router.post('/:empId/tasks', (req, res, next) => {
  try {
    // Get the empId from the parameter passed in
    let { empId } = req.params;

    // Make sure the empId is a number; it will return NaN if is not a number
    empId = parseInt(empId, 10);

    // Validate empId is a number or NaN
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // Call to mongo and insert a new tasks
    mongo(async db => {
      // Find the employee with the empId
      const employee = await db.collection('employees').findOne({ empId });

      // Check if the employee doesn't exist; then return error
      if(!employee) {
        console.error("Employee not found.");
        return next(createError(404, `Employee not found with empId: ${empId}`));
      }

      // Validate the payload with the taskSchema
      const validator = ajv.compile(taskSchema);
      const valid = validator( req.body );

      // If the payload is not valid return a 400 error and append the errors to the err.errors property
      if(!valid) {
        return next(createError(400, `Invalid payload ${validator.errors}`));
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
      // Send response to the client
      res.status(201).send({ id: newTask._id });

    }, next);

    // Catch any database errors
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
});

// Tasks array schema
const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: [ '_id', 'text' ],
        additionalProperties: false
      }
    },
    done: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: [ '_id', 'text' ],
        additionalProperties: false
      }
    }
  }
}

// Update task

router.put('/:empId/tasks', (req, res, next) => {
  try {
    // Grab the empId from the parameters
    let { empId } = req.params;

    // Parse the empId to make sure is an integer; if not it will return NaN
    empId = parseInt(empId, 10);

    // If the empId is NaN; then return an error
    if(isNaN(empId)) {
      console.error('Employee ID must be a number: ', empId)
      return next(createError(400, `Employee ID must be a number: ${empId}`));
    }

    // Call the mongo module and update the employee collections with the new task in the todo column or done column
    mongo(async db => {
      // Get the employee from the employee collection with the empId
      const employee = await db.collection('employees').findOne( { empId: empId} );

      // If the employee is not found with empId; then return error
      if(!employee) {
        console.error('Employee not found.', empId);
        return next(createError(404, `Employee not found with empId: ${empId}`));
      }

      // Get the tasks json data from the body to validate it with our tasksSchema
      const tasks = req.body;
      const validator = ajv.compile(tasksSchema);
      const valid = validator(tasks);

      // If the validation fails; then return an error
      if(!valid) {
        console.error('Invalid payload: ', validator.errors);
        return next(createError(400, `Invalid payload ${validator.errors}`));
      }

      // Update the todo array and done array of the employee with the empId
      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $set: { todo: tasks.todo, done: tasks.done } }
      )

      // Send successful response to the client
      res.status(204).send();
    }, next);

    // Catch any database errors
  } catch (err) {
    console.error('Error: ', err);
    next(err);
  }
});

// Delete Task

router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  try {

    // Grab the empId and taskId from the parameters
    let { empId } = req.params;
    let { taskId } = req.params;

    // Parse the empId to verify if it's a number; if not a number return NaN
    empId = parseInt(empId, 10);

    // Check if the empId if a number; if not return an error
    if(isNaN(empId)) {
      console.error("Employee Id must to be a number.");
      return next(createError(400, `Employee id must be a number: ${empId}`));
    }

    // Call the mongo module and update the employee collections with the new todo and done array of tasks
    mongo(async db => {
      // Get the employee from employee collection with the empId
      let employee = await db.collection('employees').findOne({ empId: empId });

      // Check if the employee is valid; If not return an error
      if(!employee) {
        console.error('Employee not found with empId:', empId);
        return next(createError(404, `Employee not found with empId: ${empId}`));
      }

      // Define the todo and done arrays if they don't exist to empty arrays
      if(!employee.todo) employee.todo = [];
      if(!employee.done) employee.done = [];

      // Filter the todo and done array with the taskId; If the taskId doesn't match then continue to next until found
      const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString());
      const done = employee.done.filter(task => task._id.toString() !== taskId.toString());

      // Update the todo and done array from the employee with empId
      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $set: { todo: todo, done: done } }
      );

      // Send successful response to the client
      res.status(204).send();
    })

    // Catch any database errors
  } catch (err) {
    console.error('Error: ', err);
    next(err);
  }
});

// Export the router
module.exports = router;