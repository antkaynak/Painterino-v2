import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {

  authenticated: boolean = false;

  constructor() { }

  logIn(){
    this.authenticated = true;
  }

  logOut(){
    this.authenticated = false;
  }
}
