import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, map, tap} from "rxjs/operators";
import * as moment from 'moment';
import {Observable} from "rxjs/internal/Observable";
import {throwError} from "rxjs/internal/observable/throwError";
import {createError} from "@angular/core/src/render3/instructions";

@Injectable()
export class AuthService {

  authenticated: boolean = false;
  private url: string = 'http://192.168.1.90:3000/api';
  private user = {};

  constructor(private http: HttpClient) { }

  logIn(email, password){
    const body = {
      email,
      password
    };
    return this.http.post(this.url+'/users/login', body,{
      observe: 'response',
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(map(res=>{
      console.log(res);
      this.setSession(res);
      return res;
    }), catchError(error=>{
      console.log(error);
      this.removeSession();
      return throwError(error);
    }));
  }

  register(email,username,password, passwordConfirm){
    const body = {
      email,
      username,
      password,
      passwordConfirm
    };
    return this.http.post(this.url+'/users',body,{
      observe: 'response',
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    }).pipe(map(res=>{
      console.log(res);
      this.setSession(res);
      return res;
    }),catchError(error=>{
      console.log(error);
      this.removeSession();
      return throwError(error);
    }));
  }

  checkJWT(){
    return localStorage.getItem("id_token") != null;
  }

  getUser(){
    return this.http.get(this.url+'/users/me').pipe(tap(res=>{
      this.user = res;
      this.authenticated = true;
    }),catchError(error => {
      this.removeSession();
      return throwError(error);
    }));
  }

  private setSession(authResult) {
    const id_token = authResult.headers.get('x-auth');
    console.log(id_token);
    //const expiresAt = moment().add(authResult.expiresIn,'second');
    localStorage.setItem('id_token', id_token);
    //localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
    this.authenticated = true;
  }

  private removeSession(){
    localStorage.clear();
    this.authenticated = false;
  }

  logOut(){
    this.http.delete(this.url+"/users/me/token")
      .pipe(catchError(error => {
        console.log(error);
        this.removeSession();
        return throwError(error);
      }))
      .subscribe(res => {
      this.removeSession();
    })
  }
}
