import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {SocketService} from "../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from "@angular/material";


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class LobbyComponent implements OnInit, OnDestroy {

  @ViewChild('room') public room: ElementRef;

  activeRooms: any = [];
  activeRoomsSubscription: Subscription;

  constructor(private authService: AuthService, private socketService: SocketService, private router: Router) { }

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

  logIn(){
    const room = this.room.nativeElement.value;
    this.socketService.selectRoom(room);
    this.authService.logIn();
    this.router.navigate(['/']);
  }

}
