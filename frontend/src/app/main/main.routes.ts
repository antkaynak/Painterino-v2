import {CanvasComponent} from "./canvas/canvas.component";
import {Routes} from "@angular/router";

export const MainRoutes: Routes = [
  {path: '', component: CanvasComponent, pathMatch: 'full'}
];
