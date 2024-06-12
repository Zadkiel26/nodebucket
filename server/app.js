/**
 * Title: app.js
 * Author: Professor Krasso
 * Date: 8/5/2023
 * Modified By: Zadkiel Rodriguez
 */
'use strict';

// Require statements
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const employeeRoute = require('./routes/employee-route');

// Create the Express app
const app = express();

// Configure the app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../dist/nodebucket')));
app.use('/', express.static(path.join(__dirname, '../dist/nodebucket')));

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WEB 450 MEAN Stack Bootcamp',
      version: '1.0.0'
    }
  },
  apis: ['./server/routes/*.js']
};

const openapiSpecification = swaggerJSDoc(options);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use('/api/employees', employeeRoute);

// error handler for 404 errors
// app.use(function(req, res, next) {
//   next(createError(404, 'Not found')); // forward to error handler
// })

// error handler for all other errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500); // set response status code

  // send response to client in JSON format with a message and stack trace
  res.json({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  });
});

module.exports = app; // export the Express application