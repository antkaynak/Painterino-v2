import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, Router, RouterStateSnapshot} from "@angular/router";
import {SocketService} from "./socket.service";
import {Observable} from "rxjs/index";
import {GameComponent} from "../game/game.component";

@Injectable()
export class GameLeaveGuardService implements CanDeactivate<GameComponent> {

  constructor(private socketService: SocketService, private router: Router) {
  }

  canDeactivate(component: GameComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (nextState.url === '/lobby/wait' && this.socketService.socket !== undefined) {
      this.socketService.socket.disconnect();
      this.router.navigate(['/lobby/rooms']);
    }
    return true;
  }


}
