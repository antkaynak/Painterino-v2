import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule, MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule, MatSliderModule, MatToolbarModule
} from "@angular/material";



const modules = [
  CommonModule,
  MatButtonModule,
  MatCardModule,
  MatListModule,
  MatInputModule,
  MatFormFieldModule,
  MatAutocompleteModule,
  MatDialogModule,
  MatSliderModule,
  MatToolbarModule
];

@NgModule({
  imports: [
   modules
  ],
  exports:[
    modules
  ],
  declarations: [

  ]
})
export class MaterialModule {
}
