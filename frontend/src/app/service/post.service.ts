import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  url = environment.baseUrl;
  headers = {
    'content-type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  constructor(private http: HttpClient) { }

  postArticle(formData): Observable<any> {
    const body = JSON.stringify(formData);
    return this.http.post<any>(`${this.url}` + 'share', body, { 'headers': this.headers });
  }
}
