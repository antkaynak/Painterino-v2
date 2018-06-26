import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatListModule} from "@angular/material";




@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule
  ],
  exports:[
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [

  ]
})
export class MaterialModule {
}
