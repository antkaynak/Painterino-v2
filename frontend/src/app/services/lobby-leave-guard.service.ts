import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from "@angular/router";
import {WaitComponent} from "../lobby/wait/wait.component";
import {Observable} from "rxjs";
import {SocketService} from "./socket.service";

@Injectable()
export class LobbyLeaveGuardService implements CanDeactivate<WaitComponent> {

  constructor(private socketService: SocketService) {
  }

  canDeactivate(component: WaitComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (nextState.url === '/lobby/rooms' && this.socketService.socket !== undefined) {
      this.socketService.socket.disconnect();
    }
    return true;
  }

}
