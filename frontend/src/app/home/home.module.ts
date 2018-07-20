import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../material.module";
import {HomeRoutes} from "./home.routes";
import {HomeComponent} from "./home.component";
import { AboutComponent } from './about/about.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(HomeRoutes)
  ],
  declarations: [
    HomeComponent,
    AboutComponent
  ],entryComponents: [
    AboutComponent
  ],
})
export class HomeModule {
}
