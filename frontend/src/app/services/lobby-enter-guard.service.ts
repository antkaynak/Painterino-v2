import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {SocketService} from "./socket.service";

@Injectable()
export class LobbyEnterGuardService implements CanActivate{

  constructor(private router: Router, private socketService: SocketService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log(this.socketService.gameState);
    if(state.url === '/'){
      //does not matter if we navigate to login or rooms because
      //their guard will decide it anyway.
      this.router.navigate(['/login']);
    }else if(state.url === '/score' && this.socketService.gameState === undefined){
      this.router.navigate(['/rooms']);
    }
    console.log(state);
    console.log(route);
    return true;
  }
}
