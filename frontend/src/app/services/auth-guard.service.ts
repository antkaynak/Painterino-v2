import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {catchError, map} from "rxjs/operators";
import {throwError} from "rxjs/internal/observable/throwError";

@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(private authService : AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    //TODO do not check every time user navigates
    if(this.authService.checkJWT()){
      return this.authService.getUser()
        .pipe(map(res=>{
          console.log('?');
          // this.router.navigate(['/rooms']);
          return true;
        }),catchError( error=>{
          this.router.navigate(['/login']);
          return throwError(error);
        }));
    }else{
      this.router.navigate(['/login']);
      return false;
    }
  }
}
