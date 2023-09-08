import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, BehaviorSubject } from 'rxjs';
import { first, catchError, tap } from "rxjs/operators";

import { User } from '../models/User';
import { ErrorHandlerService } from './error-handler.service';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = "http://localhost:3000/auth"

  isUserloggedIn$ = new BehaviorSubject<boolean>(false);
  userId!: Pick<User, "id">;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({"Content-Type": "application/json"})
   }

  constructor(private router: Router, private http: HttpClient, private errorHandlerService: ErrorHandlerService) { }

  signup(user: Omit<User, "id">): Observable<User> {
    return this.http.post<User>(`${this.url}/signup`, user, this.httpOptions).pipe(
      first(),
      catchError(this.errorHandlerService.handleError<User>("signup"))
    );
  }

  login(email: Pick<User, "email">, password: Pick<User, "password">): Observable<{token: string, userId: Pick<User, "id">}>   {
    return this.http
    .post(`${this.url}/login`, {email, password}, this.httpOptions)
    .pipe(
      tap((response: any) => {
        console.log("Api response", response); // value not storing inside tokenObject

        const tokenObject = {
          token: response.token,
          userId: response.userId
        }

        console.log("Stored Value", tokenObject);
        this.userId = tokenObject.userId;
        localStorage.setItem("token", tokenObject.token);
        this.isUserloggedIn$.next(true);
        this.router.navigate(["posts"]);
      }),
      catchError(this.errorHandlerService.handleError<{
        token: string; userId: Pick<User, "id">
      }>("login"))
    );
  }  
}
