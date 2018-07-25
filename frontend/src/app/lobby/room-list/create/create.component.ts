import {Component, OnInit} from '@angular/core';
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
  passwordDisabled: boolean = true;

  constructor(private socketService: SocketService,
              public dialogRef: MatDialogRef<CreateComponent>) {
  }

  ngOnInit() {
    this.roomForm = new FormGroup({
      'roomName': new FormControl(null, [Validators.required, BlankValidator.checkIfBlankValidator]),
      'roomPassword': new FormControl({
        value: null,
        disabled: this.passwordDisabled
      }, [BlankValidator.checkIfBlankValidator]),
      'min': new FormControl('2', [Validators.required]),
      'max': new FormControl('10', [Validators.required])
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  onSubmitted() {
    const roomName = this.roomForm.controls.roomName.value;
    const roomPassword = this.roomForm.controls.roomPassword.value;
    const min = this.roomForm.controls.min.value;
    const max = this.roomForm.controls.max.value;
    this.socketService.selectRoom({roomName, roomPassword, min, max});
    this.socketService.connectRoom('create');
    this.dialogRef.close();
  }

  passwordToggle() {
    this.passwordDisabled = !this.passwordDisabled;
    if (this.passwordDisabled) {
      this.roomForm.get('roomPassword').disable();
    } else {
      this.roomForm.get('roomPassword').enable();
    }
  }
}
