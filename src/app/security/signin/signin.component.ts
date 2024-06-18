/**
 * Title: signin.component.ts
 * Author: Professor Krasso
 * Date: 6/5/24
 * Modified By: Zadkiel Rodriguez
 */
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from '../security.service';

// Session User Interface
export interface SessionUser {
  empId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  // local variables
  errorMessage: string;
  sessionUser: SessionUser;
  isLoading: boolean = false;

  // initialize the form
  signInForm = this.fb.group({
    empId: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])]
  });

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private securityService: SecurityService) {
      // Assign the local variables
      this.errorMessage = '';
      this.sessionUser = {} as SessionUser;
  }

  // Create the sign in function
  signIn() {
    console.log("Signing in...");
    // Start the loading icon
    this.isLoading = true;
    // Get the empId value from the input field
    const empId = this.signInForm.controls['empId'].value;
    console.log(empId);

    // Check if the empId is a number; then return an error message and stop the loading icon
    if(!empId || isNaN(parseInt(empId, 10))) {
      console.error("The employee ID is invalid.");
      this.errorMessage = "The employee ID is invalid. Please try again.";
      this.isLoading = false;
      return;
    }

    console.log("Pass the if check for the empId")

    // Call the security service to find the employee with the empId
    this.securityService.findEmployeeById(empId).subscribe({
      next: (employee: any) => {
        console.log("looking for employee by id", employee);
        // Set the session user to the employee
        this.sessionUser = employee;

        // Set the session user to the empId
        this.cookieService.set('session_user', empId, 1);
        // Set the session name to the employee firstName and lastName
        this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1);

        // Set the local storage variables
        localStorage.setItem('session_user', JSON.stringify(employee));
        localStorage.setItem('session_name', `${employee.firstName} ${employee.lastName}`);

        // Create the redirect route to '/' - '/home'
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

        console.log("returning to", returnUrl);
        // Redirect the user to the home page
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        // Stop the loading icon
        this.isLoading = false;

        // Create an error message
        if(err.error.message) {
          this.errorMessage = err.error.message;
          return;
        }
        // Set the error message local variable to the error message
        this.errorMessage = err.message;
      }
    })
  }

}
