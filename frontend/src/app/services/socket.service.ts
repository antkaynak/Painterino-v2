import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import * as io from 'socket.io-client';
import {HttpClient} from "@angular/common/http";
import {flatMap} from "rxjs/operators";

export interface ChatMessage {
  message:{
    text: string,
    createdAt: any
  }
}

@Injectable()
export class SocketService {

  //TODO function names and their order

  private url = 'http://192.168.1.90:3001';
  // Our socket connection
  private socket;

  private room;

  constructor(private http: HttpClient) { }

  selectRoom(room){
    this.room = room;
  }

  getActiveRooms(){
    return timer(0, 10000)
      .pipe(flatMap(() => this.http.get('http://192.168.1.90:3001/lobby/rooms')));
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

  // connectToChat(): Subject<MessageEvent> {
  //   let observable = new Observable(observer => {
  //     this.socket.on('receiveMessage', (data) => {
  //       observer.next(data);
  //     });
  //     return () => {
  //       this.socket.disconnect();
  //     }
  //   });
  //
  //   let observer = {
  //     next: (data: Object) => {
  //       this.socket.emit('createMessage', JSON.stringify(data), function(error){
  //         console.log('callback');
  //         if(error){
  //           alert('An error occurred');
  //           return false;
  //         }
  //         return true;
  //       });
  //     },
  //   };
  //
  //   return Subject.create(observer, observable);
  // }

  connectToChat(){
    return new Observable(observer => {
      this.socket.on('receiveMessage', (data: ChatMessage)=>{
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
  }

  sendToChat(data){
    return this.socket.emit('createMessage', JSON.stringify(data), function (error){
      console.log('callback');
      if(error){
        return false;
      }
      return true;
    });
  }

  connect(): Subject<MessageEvent> {
    if(!this.room){
      console.log('No room selected.');
      return;
    }
    this.socket = io(this.url);

    this.socket.emit('join', { name:'admin', room: this.room}, function(error){
      if(error){
        return alert('An error occurred!');
      }
      console.log('Success!');
    });

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
    return Subject.create(observer, observable);
  }


}
