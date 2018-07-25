import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/internal/Subscription";
import {SocketService} from "../../services/socket.service";
import {MatDialog} from "@angular/material";
import {CreateComponent} from "./create/create.component";
import {JoinComponent} from "./join/join.component";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {first, tap} from "rxjs/operators";

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit, OnDestroy {

  activeRooms: any = [];
  activeRoomsSubscription: Subscription;
  isRefreshActive: boolean = false;

  constructor(private socketService: SocketService, private authService: AuthService,
              private router: Router, public dialog: MatDialog) {
  }


  ngOnInit() {
    this.activeRoomsSubscription = this.socketService.getActiveRooms()
      .subscribe(data => {
        this.activeRooms = data;
        this.isRefreshActive = true;
      });
  }

  ngOnDestroy() {
    if (this.activeRoomsSubscription != null) {
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

  logOut() {
    this.authService.logOut().subscribe(() => {
      this.router.navigate(['/lobby/login']);
    })
  }

  refreshList() {
    this.isRefreshActive = false;
    this.socketService.getActiveRooms()
      .pipe(first(), tap(data => {
          this.activeRooms = data;
          this.isRefreshActive = true;
        })
      )
      .subscribe();
  }
}
