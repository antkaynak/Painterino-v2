import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs/internal/Subscription";
import {SocketService} from "../../../services/socket.service";

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.css']
})
export class StopwatchComponent implements OnInit {

  timerSubscription: Subscription = null;
  timerValue;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.timerSubscription = this.socketService.connectToTimer().subscribe( (data: any)=> {
      // console.log('TICK', data);
      this.timerValue = data.tick;
    });
  }

}
