/**
 * Title: not-found.component.js
 * Author: Zadkiel Rodriguez Alvarado
 * Date: 6/18/2024
 * Description: Not Found component
 */
import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  constructor(private location: Location) {}

  // Function to return to the previous page the user was
  goBack() {
    this.location.back();
  }
}
