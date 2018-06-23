import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {Routes} from "@angular/router";

export const AppRoutes: Routes = [
  {path: 'not-found', component: PageNotFoundComponent},
  {path: '**', redirectTo: '/not-found'}
];
