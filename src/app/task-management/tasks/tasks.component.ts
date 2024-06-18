/**
 * Title: task.component.ts
 * Author: Professor Krasso
 * Date: 6/12/24
 * Modified By: Zadkiel Rodriguez
 */
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

// Task interface
export interface Item {
  _id: string;
  text: string;
}

// Employee interface
export interface Employee {
  empId: number;
  todo: Array<Item>;
  done: Array<Item>;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  // local variables
  empId: number;
  employee: Employee;
  todo: Array<Item>;
  done: Array<Item>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    // Assign the local variables
    this.empId = parseInt(this.cookieService.get('session_user'), 10);
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];

    // Call the get all tasks function
    this.getAllTasks()
  }

  getAllTasks() {
    // Call the API with the empID from the user to get the tasks
    this.http.get(`/api/employees/${ this.empId }/tasks`).subscribe({
      next: (emp: any) => {
        // Set the employee to the employee return from the API
        this.employee = emp;
      },
      error: () => {
        // Log an error if there wasn't an employee found with empId passed in
        console.error('Unable to get the employee data for employee ID: ', this.empId);
      },
      complete: () => {
        // Return the todo and done columns if there is anything on them; If they are nothing on them then return an empty array
        this.todo = this.employee.todo ?? []; // If the todo array is empty then it will be assign to an empty array
        this.done = this.employee.done ?? []; // If the done array is empty then it will be assign to an empty array
      }
    });
  }

  // Create the task using ngForm
  createTask(form: NgForm) {
    // Make sure the form is valid
    if(form.valid) {
      // Get the text value from the form input text
      const todoTask = form.value.task;

      // Do a post request to the API to save the task in the todo array
      this.http.post(`/api/employees/${ this.empId }/tasks`, { text: todoTask }).subscribe({
        next: (result: any) => {
          // Create the new task
          const newTodoItem = {
            _id: result.id,
            text: todoTask
          };
          // Push the new task to the todo array
          this.todo.push(newTodoItem);
        },
        error: (err) => {
          // Log an error if the task was not created
          console.error('Unable to create task for employee: ', this.empId, err);
        }
      })
    }
  }
}
