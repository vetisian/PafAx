import { Router } from '@angular/router';
import { AuthenticationService } from './../service/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = '';
  loginForm;

	constructor(private formBuilder: FormBuilder, private auth: AuthenticationService, private route: Router) {
    this.loginForm = this.formBuilder.group({
      username: '',
      password: ''
    });

  }

  ngOnInit(): void { }

  login(formData) {
    console.log('form data', formData);
    this.auth.login(formData).subscribe((data: any) => {
      console.log(data);
      if (data.status === 200) {
        localStorage.setItem('userData', JSON.stringify(formData));
        this.route.navigate(['/main']);
      } else {
        this.errorMessage = data.message;
      }
    });
  }

}
