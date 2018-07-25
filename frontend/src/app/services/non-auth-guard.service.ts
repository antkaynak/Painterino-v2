import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {AuthService} from "./auth.service";
import {catchError, map} from "rxjs/operators";
import {throwError} from "rxjs/internal/observable/throwError";

@Injectable()
export class NonAuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.checkJWT()) {
      return this.authService.getUser()
        .pipe(map(res => {
          this.router.navigate(['/lobby/rooms']);
          return false;
        }), catchError(error => {
          this.router.navigate(['/lobby/login']);
          return throwError(error);
        }));
    } else {
      return true;
    }
  }
}
