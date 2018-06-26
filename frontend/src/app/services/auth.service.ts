import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable()
export class AuthService {

  authenticated: boolean = false;
  private url: string = 'http://192.168.1.90:3000/api';

  constructor(private http: HttpClient) { }

  logIn(email, password){
    const body = {
      email,
      password
    };
    return this.http.post(this.url+'/users/login', body).pipe(map(res=>{
      console.log(res);
      this.authenticated = true;
      return res;
    }))
  }

  logOut(){
    this.authenticated = false;
  }
}
