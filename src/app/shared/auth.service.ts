import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private cookieService: CookieService) {}

  isLoggedIn(): boolean {
    // Check if the session_name cookie is set
    return this.cookieService.check('session_name');
  }

  getFullName(): string {
    // Retrieve the user's full name from the session_name cookie
    return this.cookieService.get('session_name') || '';
  }
}
