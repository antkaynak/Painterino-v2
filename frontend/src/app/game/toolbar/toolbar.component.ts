import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {ColorPickerService} from "ngx-color-picker";
import {Subscription} from "rxjs/internal/Subscription";
import {Router} from "@angular/router";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  timerSubscription: Subscription = null;
  timerValue = 0;

  activeWord = "error";
  activeWordSubscription: Subscription = null;
  initColor: string = '#000000';

  constructor(private socketService: SocketService, private router: Router, private cpService: ColorPickerService) { }

  ngOnInit() {
    this.activeWord = this.socketService.gameState.game.activeWord;
    this.activeWordSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any) => {
      if(gameState.status === 'over'){
        this.socketService.endGameScoreBoard = gameState.scoreBoard;
        return this.router.navigate(['/lobby/score']);
      }
      this.activeWord = gameState.game.activeWord;
    });
    this.timerSubscription = this.socketService.connectToTimer().subscribe( (data: any)=> {
      this.timerValue = data.tick;
    });
  }

  ngOnDestroy() {
    if(this.activeWordSubscription !== undefined || this.activeWordSubscription !== null){
      this.activeWordSubscription.unsubscribe();
      this.socketService.toolBar.color = '#000000';
      this.socketService.toolBar.size=  3;
    }
  }

  public onChangeColorHex8(color: string) {
    const hsva = this.cpService.stringToHsva(color, true);
    if (hsva) {
      this.socketService.toolBar.color = this.cpService.outputFormat(hsva, 'hex', null);
    }
  }

  public onChangeSize(event: any){
    this.socketService.toolBar.size = event.value;
  }

}
