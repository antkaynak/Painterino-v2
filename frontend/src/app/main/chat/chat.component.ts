import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatMessage, SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";
import {Subject} from "rxjs/index";
import {map} from "rxjs/operators";
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  // socketMessage : Subject<any>;
  socketMessageSubscription: Subscription;
  messages: Array<any> = [];

  constructor(private socketService: SocketService) {
    // this.socketMessage = <Subject<any>>socketService
    //   .connectToChat().pipe(map((response: any): any => {
    //     return response;
    //   }));
    // this.socketMessageSubscription = this.socketMessage.subscribe(msg => {
    //   this.messages.push(msg);
    // });

    this.socketMessageSubscription = this.socketService.connectToChat().subscribe((data: ChatMessage) => {
      const message = JSON.parse(data.message);
      this.pushToMessage(message);
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this.socketMessageSubscription != null) {
      this.socketMessageSubscription.unsubscribe();
    }
  }

  sendMessage(chat: HTMLInputElement) {
    const input = chat.value;
    if(input.trim() === ''){
      return;
    }
    const message : ChatMessage = {
      message:{
        text:input,
        createdAt: moment().valueOf()
      }
    };
    // const success = this.socketMessage.next(message);
    const success = this.socketService.sendToChat(message);
    console.log(success);
    if(success){
      chat.value = '';
      this.pushToMessage(message);
    }
  }

  pushToMessage(message: ChatMessage){
    const date = moment(message.message.createdAt).format('h:mm a');
    const pushMessage = `${date} : ${message.message.text}`;
    this.messages.push(pushMessage);
  }
}
