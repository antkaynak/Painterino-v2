import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouterModule} from "@angular/router";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {AppRoutes} from "./app.routes";
import {MainModule} from "./main/main.module";
import {SocketService} from "./services/socket.service";


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MainModule,
    RouterModule.forRoot(AppRoutes, {useHash: false, preloadingStrategy: PreloadAllModules})
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
