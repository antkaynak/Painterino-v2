import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MaterialModule} from "../material.module";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {AuthRoutes} from "./auth.routes";
import {ReactiveFormsModule} from "@angular/forms";


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild(AuthRoutes)
  ],
  declarations: [
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthModule {
}
