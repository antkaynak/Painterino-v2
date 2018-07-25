import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs";
import {SocketService} from "./socket.service";

@Injectable()
export class LobbyEnterGuardService implements CanActivate {

  constructor(private router: Router, private socketService: SocketService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (state.url === '/lobby') {
      //does not matter if we navigate to login or rooms because
      //their guard will decide it anyway.
      this.router.navigate(['/lobby/login']);
    } else if ((state.url === '/lobby/score' || state.url === '/lobby/wait') && this.socketService.gameState === undefined) {
      this.router.navigate(['/lobby/rooms']);
    }
    return true;
  }
}
