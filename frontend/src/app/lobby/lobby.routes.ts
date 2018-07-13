import {Routes} from "@angular/router";
import {LobbyComponent} from "./lobby.component";
import {AuthGuardService} from "../services/auth-guard.service";
import {RoomListComponent} from "./room-list/room-list.component";
import {LoginComponent} from "./auth/login/login.component";
import {NonAuthGuardService} from "../services/non-auth-guard.service";
import {RegisterComponent} from "./auth/register/register.component";
import {WaitComponent} from "./wait/wait.component";


export const LobbyRoutes: Routes = [
  {path: '', component: LobbyComponent, children: [
      {path: 'rooms', component: RoomListComponent, canActivate:[AuthGuardService]},
      {path: 'lobby', component: WaitComponent, canActivate:[AuthGuardService]},
      {path: 'login', component: LoginComponent, canActivate:[NonAuthGuardService]},
      {path: 'register', component: RegisterComponent, canActivate:[NonAuthGuardService]}
    ]},
];  //TODO fix the routes .. lobby is now / and main is now /:roomName and login is just /login /register
