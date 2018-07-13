import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ChatMessage, SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";
import * as moment from 'moment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chatList', {read: ElementRef}) public chatList : ElementRef;

  // socketMessage : Subject<any>;
  socketMessageSubscription: Subscription;

  chatData: Array<any> = [];


  constructor(private socketService: SocketService) {
    this.socketMessageSubscription = this.socketService.connectToChat().subscribe((data : ChatMessage) => {
      this.pushToMessage(data);
    });
  }

  ngOnInit() {
    const initChatData = this.socketService.gameState.game.chatData;
    for(let i = 0; i < initChatData.length; i++){
      let toChat = JSON.parse(initChatData[i]);
      this.pushToMessage(toChat);
    }
  }

  ngOnDestroy() {
    if(this.socketMessageSubscription != null) {
      this.socketMessageSubscription.unsubscribe();
    }
  }

  scrollChat(){
    const clientHeight = this.chatList.nativeElement.clientHeight;
    const scrollTop = this.chatList.nativeElement.scrollTop;
    const scrollHeight = this.chatList.nativeElement.scrollHeight;
    const scrollIndex = 150; //A constant to fix scroll detection

    if (clientHeight + scrollTop + scrollIndex >= scrollHeight) {

      console.log(scrollTop);
      console.log(scrollHeight);
      console.log(this.chatList);
      this.chatList.nativeElement.scrollTop = scrollHeight;
      console.log(this.chatList.nativeElement.scrollTop);
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
      this.scrollChat();
    }
  }

  pushToMessage(message: ChatMessage){
    const date = moment(message.message.createdAt).format('h:mm a');
    const pushMessage = `${date} : ${message.message.text}`;
    this.chatData.push(pushMessage);
    this.scrollChat();
  }
}
