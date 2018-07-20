import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule,
  MatProgressBarModule, MatSelectModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatTableModule,
  MatToolbarModule
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
  MatToolbarModule,
  MatTableModule,
  MatProgressBarModule,
  MatSlideToggleModule,
  MatSelectModule
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
