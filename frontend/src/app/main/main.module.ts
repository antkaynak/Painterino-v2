import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {MainRoutes} from "./main.routes";
import {CanvasComponent} from "./canvas/canvas.component";
import {MainComponent} from "./main.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import { UserListComponent } from './user-list/user-list.component';
import { ChatComponent } from './chat/chat.component';
import {MaterialModule} from "../material.module";


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    RouterModule.forChild(MainRoutes)
  ],
  declarations: [
    MainComponent,
    CanvasComponent,
    UserListComponent,
    ChatComponent
  ]
})
export class MainModule {
}
