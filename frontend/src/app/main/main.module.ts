import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {MainRoutes} from "./main.routes";
import {CanvasComponent} from "./canvas/canvas.component";
import {MatButtonModule} from '@angular/material';
import {MainComponent} from "./main.component";
import {FlexLayoutModule} from "@angular/flex-layout";


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild(MainRoutes),MatButtonModule
  ],
  declarations: [
    MainComponent,
    CanvasComponent
  ]
})
export class MainModule {
}
