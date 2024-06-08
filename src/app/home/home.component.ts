/**
 * Title: home.component.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 * Modified By: Zadkiel Rodriguez
 */

// imports statements
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  fullName: string = '';

  constructor(public authService: AuthService, private cookieService: CookieService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if(this.isLoggedIn) {
      this.fullName = this.cookieService.get('session_name') || '';
    }
  }
}
