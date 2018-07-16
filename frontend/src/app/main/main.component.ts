import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../services/socket.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

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
