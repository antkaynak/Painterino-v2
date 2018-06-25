import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatCardModule, MatInputModule, MatListModule} from "@angular/material";




@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatInputModule
  ],
  exports:[
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatInputModule
  ],
  declarations: [

  ]
})
export class MaterialModule {
}
