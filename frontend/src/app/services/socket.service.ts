import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import * as io from 'socket.io-client';
import {HttpClient} from "@angular/common/http";
import {flatMap, map} from "rxjs/operators";
import {Router} from "@angular/router";

export interface ChatMessage {
  message:{
    text: string,
    createdAt: any
  }
}

@Injectable()
export class SocketService {

  //TODO function names and their order

  subjectXY: Subject<any>;
  initCanvasData;
  initUserList;
  initChat;

  private url = 'http://localhost:3000';
  // Our socket connection
  private socket;

  private room: { roomName: null, roomPassword: null };

  constructor(private http: HttpClient, private router: Router) { }

  selectRoom(room){
    this.room = room;
  }


  getActiveRooms(){
    return timer(0, 10000)
      .pipe(flatMap(() => this.http.get(this.url+'/lobby/rooms')));
  }

  getActiveUsers(){
    return new Observable(observer => {
      this.socket.on('updateUserList', (data)=>{
        observer.next(data);
      });
      return ()=> {
        this.socket.disconnect();
      }
    });
  }


  connectToChat(){
    return new Observable(observer => {
      this.socket.on('receiveMessage', (data)=>{
        observer.next(JSON.parse(data.message));
      });
      return () => {
        this.socket.disconnect();
      }
    });
  }

  sendToChat(data){
    return this.socket.emit('createMessage', JSON.stringify(data), function (error){
      if(error){
        console.log(error);
        alert('An error occurred sending message to the chat.');
      }
    });
  }

  createRoom(): Subject<MessageEvent> {
    if(!this.room || this.room == null || this.room == undefined){
      console.log('No room selected.');
      return;
    }
    this.socket = io(this.url);

    this.socket.emit('create', { room:this.room, token: localStorage.getItem("id_token")}, function(error){
      if(error){
        console.log(error);
      }
    });

    this.socket.on('createResponse', (data)=> {
      if(data.status === 'success'){
        this.initCanvasData = data.game.canvasData;
        this.initUserList = data.game.activeUserList;
        this.initChat = data.game.chatData;
        // We define our observable which will observe any incoming messages
        // from our socket.io server.
        let observable = new Observable(observer => {
          this.socket.on('receiveXY', (data) => {
            observer.next(data);
          });
          return () => {
            this.socket.disconnect();
          }
        });

        // We define our Observer which will listen to messages
        // from our other components and send messages back to our
        // socket server whenever the `next()` method is called.
        let observer = {
          next: (data: Object) => {
            this.socket.emit('createXY', JSON.stringify(data));
          },
        };

        // we return our Rx.Subject which is a combination
        // of both an observer and observable.
        this.subjectXY =  Subject.create(observer, observable).pipe(map((response: any): any => {
          return response;
        }));
        this.router.navigate(['/room/'+this.room.roomName]);
      }else if(data.status === 'fail'){
        alert('An error occurred.');
      }
    });


  }

  //TODO make joinRoom and createRoom functions shorter

  joinRoom(): Subject<MessageEvent> {
    if(!this.room || this.room == null || this.room == undefined){
      console.log('No room selected.');
      return;
    }
    this.socket = io(this.url);

    this.socket.emit('join', { room:this.room, token: localStorage.getItem("id_token")}, function(error){
      if(error){
        console.log(error);
      }
    });

    this.socket.on('joinResponse', (data)=> {
      if(data.status === 'success'){
        this.initCanvasData = data.game.canvasData;
        this.initUserList = data.game.activeUserList;
        this.initChat = data.game.chatData;
        // We define our observable which will observe any incoming messages
        // from our socket.io server.
        let observable = new Observable(observer => {
          this.socket.on('receiveXY', (data) => {
            observer.next(data);
          });
          return () => {
            this.socket.disconnect();
          }
        });

        // We define our Observer which will listen to messages
        // from our other components and send messages back to our
        // socket server whenever the `next()` method is called.
        let observer = {
          next: (data: Object) => {
            this.socket.emit('createXY', JSON.stringify(data));
          },
        };

        // we return our Rx.Subject which is a combination
        // of both an observer and observable.
        this.subjectXY =  Subject.create(observer, observable).pipe(map((response: any): any => {
          return response;
        }));

        this.router.navigate(['/room/'+this.room.roomName]);
      }else if(data.status === 'fail'){
        alert('An error occurred.');
      }
    });

  }


}
