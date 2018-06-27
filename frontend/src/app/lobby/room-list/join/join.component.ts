import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {CreateComponent} from "../create/create.component";
import * as BlankValidator from "../../../services/validators/blank.validator";
import {Router} from "@angular/router";
import {SocketService} from "../../../services/socket.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  roomForm: FormGroup;

  constructor(private socketService: SocketService, private router: Router,
              public dialogRef: MatDialogRef<CreateComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log(this.data);
    this.roomForm = new FormGroup({
      'roomName': new FormControl(this.data.roomName,[Validators.required, BlankValidator.checkIfBlankValidator]),
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
    this.router.navigate(['/']);
  }


}
