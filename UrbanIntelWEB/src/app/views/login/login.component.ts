import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef;

  toggleForm() {
    this.wrapperRef.nativeElement.classList.toggle('active');
  }
}
