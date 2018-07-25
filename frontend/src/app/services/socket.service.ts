import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import * as io from 'socket.io-client';
import {HttpClient} from "@angular/common/http";
import {first, flatMap, map, tap} from "rxjs/operators";
import {Router} from "@angular/router";

export interface ChatMessage {
  message: {
    text: string,
    createdAt: any,
    userName: string
  }
}

@Injectable()
export class SocketService {

  subjectXY: Subject<any>;
  gameState;
  toolBar = {
    color: '#000000',
    size: 3
  };
  endGameScoreBoard;
  socket;

  private url = 'http://localhost:3000';
  private room: { roomName: null, roomPassword: null, min: 2, max: 10 };

  constructor(private http: HttpClient, private router: Router) {
  }

  selectRoom(room) {
    this.room = room;
  }


  getActiveRooms() {
    return timer(0, 10000)
      .pipe(flatMap(() => this.http.get(this.url + '/lobby/rooms')));
  }

  connectToTimer() {
    return new Observable(observer => {
      this.socket.on('timer', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    });
  }

  connectToLatency() {
    return new Observable(observer => {
      this.socket.on('pong', (latency) => {
        observer.next(latency);
      });
    });
  }

  connectToChat() {
    return new Observable(observer => {
      this.socket.on('receiveMessage', (data) => {
        observer.next(JSON.parse(data.message));
      });
      return () => {
        this.socket.disconnect();
      }
    });
  }

  sendToChat(data) {
    return this.socket.emit('createMessage', JSON.stringify(data), function (error) {
      if (error) {
        alert('An error occurred sending message to the chat.');
      }
    });
  }

  //gives a disconnect event even when the game ends
  // listenDisconnect(){
  //   this.socket.on('disconnect', ()=> {
  //     this.gameState = null;
  //     this.router.navigate(['/']);
  //     alert('Connection with the server lost.');
  //   });
  // }

  connectRoom(type): Subject<MessageEvent> {
    if (!this.room || this.room == null || this.room == undefined) {
      console.log('No room selected.');
      return;
    }
    this.gameState = null;
    this.socket = io(this.url);

    this.createGameStateObservable().pipe(
      first(),
      tap((gameState: any) => {
        this.gameState = gameState;
        if (gameState.status === 'success') {
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
          this.subjectXY = Subject.create(observer, observable).pipe(map((response: any): any => {
            return response;
          }));

          if (this.gameState.game.status === 1) {
            this.router.navigate(['/game']);
          } else {

            this.router.navigate(['/lobby/wait']);
          }

        } else if (gameState.status === 'fail') {
          alert(gameState.errorMessage);
        }
      })).subscribe();

    if (type === 'create') {
      this.socket.emit('create', {room: this.room, token: localStorage.getItem("id_token")});
    } else if (type === 'join') {
      this.socket.emit('join', {room: this.room, token: localStorage.getItem("id_token")});
    } else {
      alert('error');
    }

  }


  createGameStateObservable() {
    return new Observable(observer => {
      this.socket.on('gameState', (gameState) => {
        observer.next(gameState);
      })
    });
  }


}
