import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/internal/Subscription";
import {Router} from "@angular/router";
import {SocketService} from "../../services/socket.service";
import {MatDialog} from "@angular/material";
import {CreateComponent} from "./create/create.component";
import {JoinComponent} from "./join/join.component";

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit, OnDestroy {

  activeRooms: any = [];
  activeRoomsSubscription: Subscription;

  constructor(private socketService: SocketService, public dialog: MatDialog) { }


  ngOnInit() {
    this.activeRoomsSubscription = this.socketService.getActiveRooms()
      .subscribe(data=>{
        console.log(data);
        this.activeRooms = data;
      });
  }

  ngOnDestroy() {
    if(this.activeRoomsSubscription != null){
      this.activeRoomsSubscription.unsubscribe();
    }
  }

  openCreate() {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }

  openJoin(roomName) {
    console.log('hey', roomName);
    const dialogRef = this.dialog.open(JoinComponent, {
      width: '400px',
      data: {roomName}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
    });
  }
}
