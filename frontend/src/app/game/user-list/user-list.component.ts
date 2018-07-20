import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";
import {Router} from "@angular/router";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  userList: any = [];
  currentTurn: number;
  _turn: number;
  userListSubscription: Subscription;


  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.userList = this.socketService.gameState.game.userList;
    this.currentTurn = this.socketService.gameState.game.currentTurn;
    this._turn = this.socketService.gameState.game._turn;

    this.userListSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any)=>{
      if(gameState.status === 'over'){
          return;
      }

        this.userList = gameState.game.userList;
      if(this.currentTurn !== gameState.game.currentTurn){
        this._turn = gameState.game._turn;
      }
        this.currentTurn = gameState.game.currentTurn;

    });

  }

  ngOnDestroy() {
    if(this.userListSubscription != null){
      this.userListSubscription.unsubscribe();
    }
  }

}
