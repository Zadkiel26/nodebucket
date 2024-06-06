/**
 * Title: nav.component.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 * Modified By: Zadkiel Rodriguez
 */

// imports statements
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export interface AppUser {
  fullName: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  appUser: AppUser;
  isSignedIn: boolean;

  constructor(private cookieService: CookieService) {
    this.appUser = {} as AppUser;
    this.isSignedIn = this.cookieService.get('session_user') ? true : false;

    if(this.isSignedIn) {
      this.appUser = {
        fullName: this.cookieService.get('session_name')
      }
      console.log('Signed in as', this.appUser);
    }
  }

  signOut() {
    console.log('Removing the session_user from the cookie');
    this.cookieService.deleteAll();
    window.location.href = '/';
  }
}
