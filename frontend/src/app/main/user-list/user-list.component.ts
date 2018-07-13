import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  userList: any = [];
  userListSubscription: Subscription;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.userList = this.socketService.gameState.game.userList;
    this.userListSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any)=>{
      console.log("user-list 22 " ,gameState);
      this.userList = gameState.game.userList;
    });
  }

  ngOnDestroy() {
    if(this.userListSubscription != null){
      this.userListSubscription.unsubscribe();
    }
  }

}
