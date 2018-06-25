import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";

import {FlexLayoutModule} from "@angular/flex-layout";
import {LobbyRoutes} from "./lobby.routes";
import {AuthComponent} from "./auth/auth.component";
import {LobbyComponent} from "./lobby.component";
import {MaterialModule} from "../material.module";


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule.forChild(LobbyRoutes)
  ],
  declarations: [
    LobbyComponent,
    AuthComponent
  ]
})
export class LobbyModule {
}
