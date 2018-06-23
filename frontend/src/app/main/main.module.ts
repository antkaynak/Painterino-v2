import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {MainRoutes} from "./main.routes";
import {CanvasComponent} from "./canvas/canvas.component";


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MainRoutes)
  ],
  declarations: [
    CanvasComponent
  ]
})
export class MainModule {
}
