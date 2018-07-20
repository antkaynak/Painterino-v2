import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";
import {Routes} from "@angular/router";

export const AppRoutes: Routes = [
  // {path: 'game', loadChildren: './faq/faq.module#FaqModule'},
  {path: 'game', loadChildren: './game/game.module#GameModule'},
  {path: 'not-found', component: PageNotFoundComponent},
  {path: '**', redirectTo: '/not-found'}
];
