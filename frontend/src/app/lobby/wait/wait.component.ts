import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";
import {Router} from "@angular/router";

@Component({
  selector: 'app-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent implements OnInit, OnDestroy {

  activeUserList = [];

  gameStateSubscription: Subscription;



  constructor(private socketService : SocketService, private router: Router) { }

  ngOnInit() {
    this.activeUserList = this.socketService.gameState.game.userList;

    if(this.socketService.gameState.game.status === 0){
      this.gameStateSubscription = this.socketService.createGameStateObservable().subscribe( (gameState:any) =>{
        this.socketService.gameState = gameState;
        if(gameState.game.status === 1){
          this.router.navigate(['/game']);
        }else{
          this.activeUserList = gameState.game.userList;
        }
      });
    }else if(this.socketService.gameState.game.status === 1){
      this.router.navigate(['/game']);
    }

  }

  ngOnDestroy() {
    if(this.gameStateSubscription != null){
      this.gameStateSubscription.unsubscribe();
    }
  }

}
