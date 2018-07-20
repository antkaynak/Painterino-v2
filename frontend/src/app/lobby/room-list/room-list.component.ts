import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/internal/Subscription";
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
        this.activeRooms = data;
      });
  }

  ngOnDestroy() {
    if(this.activeRoomsSubscription != null){
      this.activeRoomsSubscription.unsubscribe();
    }
  }

  openCreate() {
    this.dialog.closeAll();
    this.dialog.open(CreateComponent, {
      width: '500px'
    });
  }

  openJoin(roomName) {
    this.dialog.closeAll();
    this.dialog.open(JoinComponent, {
      width: '500px',
      data: roomName
    });
  }
}
