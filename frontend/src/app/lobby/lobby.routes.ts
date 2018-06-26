import {Routes} from "@angular/router";
import {LobbyComponent} from "./lobby.component";
import {AuthGuardService} from "../services/auth-guard.service";


export const LobbyRoutes: Routes = [
  {path: 'lobby', component: LobbyComponent, canActivate:[AuthGuardService]}
];
