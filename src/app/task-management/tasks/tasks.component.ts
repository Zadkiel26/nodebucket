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

export interface Item {
  _id: string;
  text: string;
}

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
  empId: number;
  employee: Employee;
  todo: Array<Item>;
  done: Array<Item>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.empId = parseInt(this.cookieService.get('session_user'), 10);
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];

    this.getAllTasks()
  }

  getAllTasks() {
    this.http.get(`/api/employees/${ this.empId }/tasks`).subscribe({
      next: (emp: any) => {
        this.employee = emp;
      },
      error: () => {
        console.error('Unable to get the employee data for employee ID: ', this.empId);
      },
      complete: () => {
        this.todo = this.employee.todo ?? []; // If the todo array is empty then it will be assign to an empty array
        this.done = this.employee.done ?? []; // If the done array is empty then it will be assign to an empty array
      }
    });
  }

  createTask(form: NgForm) {
    if(form.valid) {
      const todoTask = form.value.task;

      this.http.post(`/api/employees/${ this.empId }/tasks`, { text: todoTask }).subscribe({
        next: (result: any) => {
          const newTodoItem = {
            _id: result.id,
            text: todoTask
          };
          this.todo.push(newTodoItem);
        },
        error: (err) => {
          console.error('Unable to create task for employee: ', this.empId, err);
        }
      })
    }
  }
}
