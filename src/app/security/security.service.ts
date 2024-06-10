/**
 * Title: security.service.ts
 * Author: Professor Krasso
 * Date: 6/5/24
 * Modified By: Zadkiel Rodriguez
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  findEmployeeById(empId: number) {
    console.log("Finding employee by ID", empId);
    return this.http.get('/api/employees/' + empId);
  }
}