import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {GameRoutes} from "./game.routes";
import {CanvasComponent} from "./canvas/canvas.component";
import {GameComponent} from "./game.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import { UserListComponent } from './user-list/user-list.component';
import { ChatComponent } from './chat/chat.component';
import {MaterialModule} from "../material.module";
import {ColorPickerModule} from "ngx-color-picker";
import { ToolbarComponent } from './toolbar/toolbar.component';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ColorPickerModule,
    RouterModule.forChild(GameRoutes)
  ],
  declarations: [
    GameComponent,
    CanvasComponent,
    UserListComponent,
    ChatComponent,
    ToolbarComponent
  ]
})
export class GameModule {
}
