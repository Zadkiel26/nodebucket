import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from '../security.service';

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

  errorMessage: string;
  sessionUser: SessionUser;
  isLoading: boolean = false;

  signInForm = this.fb.group({
    empId: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])]
  });

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private securityService: SecurityService) {
      this.errorMessage = '';
      this.sessionUser = {} as SessionUser;
  }

  signIn() {
    console.log("Signing in...");
    this.isLoading = true;
    const empId = this.signInForm.controls['empId'].value;
    console.log(empId);

    if(!empId || isNaN(parseInt(empId, 10))) {
      console.log("The employee ID is invalid.");
      this.errorMessage = "The employee ID is invalid.";
      this.isLoading = false;
      return;
    }

    console.log("Pass the if check for the empId")

    this.securityService.findEmployeeById(empId).subscribe({
      next: (employee: any) => {
        console.log("looking for employee by id", employee);
        this.sessionUser = employee;

        this.cookieService.set('session_user', empId, 1);
        this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

        console.log("returning to", returnUrl);
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;

        if(err.error.message) {
          this.errorMessage = err.error.message;
          return;
        }

        this.errorMessage = err.message;
      }
    })
  }

}
