import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {ColorPickerService} from "ngx-color-picker";
import {Subscription} from "rxjs/internal/Subscription";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit, OnDestroy {


  activeWord = "error";
  activeWordSubscription: Subscription = null;
  initColor: string = '#000000';

  constructor(private socketService: SocketService,  private cpService: ColorPickerService) { }

  ngOnInit() {
    this.activeWord = this.socketService.gameState.game.activeWord;
    this.activeWordSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any) => {
      if(gameState.status === 'over'){
        return;
      }
      this.activeWord = gameState.game.activeWord;
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
