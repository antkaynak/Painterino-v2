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
import {ColorPickerModule} from "ngx-color-picker";
import { StopwatchComponent } from './toolbar/stopwatch/stopwatch.component';
import { ToolbarComponent } from './toolbar/toolbar.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ColorPickerModule,
    RouterModule.forChild(MainRoutes)
  ],
  declarations: [
    MainComponent,
    CanvasComponent,
    UserListComponent,
    ChatComponent,
    StopwatchComponent,
    ToolbarComponent
  ]
})
export class MainModule {
}
