import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {SocketService} from "../../../services/socket.service";
import {MatDialogRef} from "@angular/material";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as BlankValidator from "../../../services/validators/blank.validator"

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  roomForm: FormGroup;

  constructor(private socketService: SocketService, private router: Router,
              public dialogRef: MatDialogRef<CreateComponent>,) { }

  ngOnInit() {
    this.roomForm = new FormGroup({
      'roomName': new FormControl(null,[Validators.required, BlankValidator.checkIfBlankValidator]),
      'roomPassword': new FormControl(null,[BlankValidator.checkIfBlankValidator])
    });
  }

  cancel(){
    this.dialogRef.close();
  }

  onSubmitted(){
    const roomName = this.roomForm.controls.roomName.value;
    const roomPassword = this.roomForm.controls.roomPassword.value;
    this.socketService.selectRoom({roomName, roomPassword});
    this.dialogRef.close();
    this.router.navigate(['/room/'+roomName]);
  }

}
