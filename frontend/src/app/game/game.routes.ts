import {Routes} from "@angular/router";
import {GameComponent} from "./game.component";
import {AuthGuardService} from "../services/auth-guard.service";
import {GameEnterGuardService} from "../services/game-enter-guard.service";
import {GameLeaveGuardService} from "../services/game-leave-guard.service";

export const GameRoutes: Routes = [
  {
    path: '',
    component: GameComponent,
    canActivate: [AuthGuardService, GameEnterGuardService],
    canDeactivate: [GameLeaveGuardService]
  }
];
