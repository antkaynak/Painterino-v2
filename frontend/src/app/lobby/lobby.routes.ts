import {Routes} from "@angular/router";
import {LobbyComponent} from "./lobby.component";
import {AuthGuardService} from "../services/auth-guard.service";
import {RoomListComponent} from "./room-list/room-list.component";
import {LoginComponent} from "./auth/login/login.component";
import {NonAuthGuardService} from "../services/non-auth-guard.service";
import {RegisterComponent} from "./auth/register/register.component";


export const LobbyRoutes: Routes = [
  {path: 'lobby', component: LobbyComponent, children: [
      {path: 'rooms', component: RoomListComponent, canActivate:[AuthGuardService]},
      {path: 'login', component: LoginComponent, canActivate:[NonAuthGuardService]},
      {path: 'register', component: RegisterComponent, canActivate:[NonAuthGuardService]}
    ]},
];
