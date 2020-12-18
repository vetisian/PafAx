import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  url = environment.baseUrl;
  headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  constructor(private http: HttpClient) { }

  login(formData): Observable<any> {
    const body = JSON.stringify(formData);
    return this.http.post<any>(`${this.url}` + 'login', body, { 'headers': this.headers });
  }
}
