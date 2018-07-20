import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../services/socket.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-main',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    if(this.socketService.subjectXY === undefined || this.socketService.subjectXY === null){
      this.router.navigate(['/rooms']);
    }
  }

  ngOnDestroy() {
    // if(this.socketService.socket !== undefined){
    //   this.socketService.socket.disconnect();
    // }
  }

}
