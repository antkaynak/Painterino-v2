import {Routes} from "@angular/router";
import {MainComponent} from "./main.component";
import {AuthGuardService} from "../services/auth-guard.service";

export const MainRoutes: Routes = [
  {path: '', component: MainComponent, canActivate: [AuthGuardService]}
];
