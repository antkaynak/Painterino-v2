import {Routes} from "@angular/router";
import {NonAuthGuardService} from "../services/non-auth-guard.service";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";


export const AuthRoutes: Routes = [
  {path: 'login', component: LoginComponent, canActivate:[NonAuthGuardService]},
  {path: 'register', component: RegisterComponent, canActivate:[NonAuthGuardService]}
];
