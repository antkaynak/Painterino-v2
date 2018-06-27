import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";

import {FlexLayoutModule} from "@angular/flex-layout";
import {LobbyRoutes} from "./lobby.routes";
import {LobbyComponent} from "./lobby.component";
import {MaterialModule} from "../material.module";
import { RoomListComponent } from './room-list/room-list.component';
import {LoginComponent} from "./auth/login/login.component";
import {RegisterComponent} from "./auth/register/register.component";
import {ReactiveFormsModule} from "@angular/forms";
import { CreateComponent } from './room-list/create/create.component';
import { JoinComponent } from './room-list/join/join.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild(LobbyRoutes)
  ],
  declarations: [
    LobbyComponent,
    RoomListComponent,
    LoginComponent,
    RegisterComponent,
    CreateComponent,
    JoinComponent
  ],entryComponents: [
    CreateComponent,
    JoinComponent
  ],
})
export class LobbyModule {
}
