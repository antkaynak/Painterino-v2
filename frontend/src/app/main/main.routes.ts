import {Routes} from "@angular/router";
import {MainComponent} from "./main.component";
import {AuthGuardService} from "../services/auth-guard.service";
import {GameEnterGuardService} from "../services/game-enter-guard.service";

export const MainRoutes: Routes = [
  {path: 'game', component: MainComponent, canActivate: [AuthGuardService, GameEnterGuardService]}
];
