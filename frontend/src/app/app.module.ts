import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, RouterModule} from "@angular/router";
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {AppRoutes} from "./app.routes";
import {GameModule} from "./game/game.module";
import {SocketService} from "./services/socket.service";
import {AuthService} from "./services/auth.service";
import {AuthGuardService} from "./services/auth-guard.service";
import {LobbyModule} from "./lobby/lobby.module";
import {NonAuthGuardService} from "./services/non-auth-guard.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptorService} from "./services/auth-interceptor.service";
import {MAT_DIALOG_DEFAULT_OPTIONS} from "@angular/material";
import {LobbyLeaveGuardService} from "./services/lobby-leave-guard.service";
import {LobbyEnterGuardService} from "./services/lobby-enter-guard.service";
import {GameEnterGuardService} from "./services/game-enter-guard.service";
import {GameLeaveGuardService} from "./services/game-leave-guard.service";
import {HomeModule} from "./home/home.module";
import {MaterialModule} from "./material.module";



@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    HomeModule,
    // GameModule,
    LobbyModule,
    RouterModule.forRoot(AppRoutes, {useHash: false, preloadingStrategy: PreloadAllModules})
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
    SocketService, AuthService, AuthGuardService, NonAuthGuardService,
    LobbyLeaveGuardService, LobbyEnterGuardService, GameEnterGuardService,
    GameLeaveGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
