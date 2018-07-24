import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {pairwise, switchMap, takeUntil} from 'rxjs/operators';
import {fromEvent} from "rxjs/internal/observable/fromEvent";
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";



@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, OnDestroy, AfterViewInit {

  socketXYSubscription: Subscription = null;
  gameStateSubscription: Subscription = null;

  canvasData = [];
  activeTurnSocketId;


  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    this.canvasData = this.socketService.gameState.game.canvasData;

    this.activeTurnSocketId = this.socketService.gameState.game.activeTurnSocketId;

    this.gameStateSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any) => {
      if(gameState.status === 'over'){
        return;
      }
      this.activeTurnSocketId = gameState.game.activeTurnSocketId;

      if(gameState.game.canvasData.length < 1){
        this.canvasData = [];
        this.clearCanvas();
      }
    });

    if(this.socketService.subjectXY !== undefined || this.socketService.subjectXY !== null){
      this.socketXYSubscription = this.socketService.subjectXY.subscribe(xy => {
        xy = JSON.parse(xy);
        this.drawOnCanvas(xy.prevPos, xy.currentPos, xy.color, xy.size);
      });
    }
  }


  ngOnDestroy() {
    if(this.socketXYSubscription != null){
      this.socketXYSubscription.unsubscribe();
    }
    if(this.gameStateSubscription != null){
      this.gameStateSubscription.unsubscribe();
    }
  }

  // a reference to the canvas element from our template
  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('canvasDiv') public canvasDiv: ElementRef;

  @HostListener('window:resize', ['$event'])
  sizeChange(event) {
    this.canvas.nativeElement.style.width = this.canvasDiv.nativeElement.offsetWidth+'px';
    this.canvas.nativeElement.style.height = this.canvasDiv.nativeElement.offsetHeight+'px';
  }

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {
    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');
    // set the width and height
    this.canvas.nativeElement.style.width = this.canvasDiv.nativeElement.offsetWidth+'px';
    this.canvas.nativeElement.style.height = this.canvasDiv.nativeElement.offsetHeight+'px';

    // set some default properties about the line
    this.cx.lineWidth = this.socketService.toolBar.size;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = this.socketService.toolBar.color;

    this.captureEvents(canvasEl);

    for(let i = 0; i < this.canvasData.length; i++){
      let toDraw = JSON.parse(this.canvasData[i]);
      this.drawOnCanvas(toDraw.prevPos, toDraw.currentPos, toDraw.color, toDraw.size);
    }
  }


    getMousePos(clientX, clientY) {

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    let X = (clientX - rect.left) / (this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.width);
    let Y = (clientY - rect.top) / (this.canvas.nativeElement.clientHeight / this.canvas.nativeElement.height);
    X = Math.ceil(X);
    Y = Math.ceil(Y);
    return {
      x: X,
      y: Y
    };
  }


  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
      fromEvent(canvasEl, 'mousedown').pipe(
      switchMap((e) => {
        // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove').pipe(
          // we'll stop (and unsubscribe) once the user releases the mouse
          // this will trigger a 'mouseup' event
          takeUntil(fromEvent(canvasEl, 'mouseup')),
          // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
          takeUntil(fromEvent(canvasEl, 'mouseleave')),
          // pairwise lets us get the previous value to draw a line from
          // the previous point to the current point
          pairwise())
      }))
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        //check if the user can draw in this turn
        if(this.socketService.socket.id !== this.activeTurnSocketId){
          return;
        }

        const prevPos = this.getMousePos(res[0].clientX, res[0].clientY);
        const currentPos = this.getMousePos(res[1].clientX, res[1].clientY);

        this.socketService.subjectXY.next({
          prevPos,
          currentPos,
          color: this.socketService.toolBar.color,
          size: this.socketService.toolBar.size
        });
        this.drawOnCanvas(prevPos, currentPos, this.socketService.toolBar.color, this.socketService.toolBar.size);
      });


    fromEvent(canvasEl, 'touchstart').pipe(
      switchMap((e) => {
        return fromEvent(canvasEl, 'touchmove').pipe(
          takeUntil(fromEvent(canvasEl, 'touchend')),
          pairwise())
      }))
      .subscribe((res: [TouchEvent, TouchEvent]) => {
        //check if the user can draw in this turn
        if(this.socketService.socket.id !== this.activeTurnSocketId){
          return;
        }
        // previous and current position with the offset
        const prevPos = this.getMousePos(res[0].touches[0].clientX, res[0].touches[0].clientY);
        const currentPos = this.getMousePos(res[1].touches[0].clientX, res[1].touches[0].clientY);

        this.socketService.subjectXY.next({
          prevPos,
          currentPos,
          color: this.socketService.toolBar.color,
          size: this.socketService.toolBar.size
        });
        this.drawOnCanvas(prevPos, currentPos, this.socketService.toolBar.color, this.socketService.toolBar.size);
      });


  }

  private clearCanvas(){
    // this.cx.clearRect(0,0,this.canvasDiv.nativeElement.offsetWidth, this.canvasDiv.nativeElement.offsetHeight);
    this.cx.clearRect(0,0,this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  private drawOnCanvas(prevPos: { x: number, y: number }, currentPos: { x: number, y: number }, color, size) {
    // in case the context is not set
    if (!this.cx) { return; }

    // start our drawing path
    this.cx.beginPath();


    // we're drawing lines so we need a previous position
    if (prevPos) {
      // sets the start point
      this.cx.moveTo(prevPos.x, prevPos.y); // from
      // draws a line from the start pos until the current position
      this.cx.lineTo(currentPos.x, currentPos.y);

      // this.cx.fillStyle = color;
      this.cx.strokeStyle = color;
      this.cx.lineWidth = size;

      // strokes the current path with the styles we set earlier
      this.cx.stroke();
    }
  }

}
