import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/internal/Subscription";
import {Router} from "@angular/router";
import {SocketService} from "../../services/socket.service";

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit, OnDestroy {

  activeRooms: any = [];
  activeRoomsSubscription: Subscription;

  constructor(private socketService: SocketService, private router: Router) { }


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

  selectRoom(room : HTMLInputElement){
    const selectedRoom = room.value;
    this.socketService.selectRoom(selectedRoom);
    this.router.navigate(['/']);
  }

}
