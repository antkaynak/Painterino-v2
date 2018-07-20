import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {CreateComponent} from "../../lobby/room-list/create/create.component";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CreateComponent>) { }

  ngOnInit() {
  }


  cancel(){
    this.dialogRef.close();
  }

}
