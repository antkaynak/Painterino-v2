import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {SocketService} from "./socket.service";
import {Observable} from "rxjs/index";

@Injectable()
export class GameEnterGuardService implements CanActivate{

  constructor(private router: Router, private socketService: SocketService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.socketService.socket === undefined || this.socketService.socket === null){
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
