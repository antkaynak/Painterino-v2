import {Routes} from "@angular/router";
import {LobbyComponent} from "./lobby.component";
import {AuthComponent} from "./auth/auth.component";
import {NonAuthGuardService} from "../services/non-auth-guard.service";

export const LobbyRoutes: Routes = [
  {path: 'lobby', component: LobbyComponent, canActivate: [NonAuthGuardService] , children:[
      {path: 'login', component: AuthComponent}
    ]}
];
