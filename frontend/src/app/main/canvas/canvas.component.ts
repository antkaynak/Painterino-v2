import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {pairwise, switchMap, takeUntil} from 'rxjs/operators';
import {fromEvent} from "rxjs/internal/observable/fromEvent";
import {SocketService} from "../../services/socket.service";
import {Subject} from "rxjs";
import { map } from 'rxjs/operators';
import {Subscription} from "rxjs/internal/Subscription";
import {ColorPickerService} from "ngx-color-picker";
import {Router} from "@angular/router";


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, OnDestroy, AfterViewInit {

  // socketXY : Subject<any>;
  socketXYSubscription: Subscription = null;
  gameStateSubscription: Subscription = null;
  canvasData = [];
  activeTurnSocketId;

  activeWord = "error";



  public selectedColor: string = '#000000';
  public selectedSize: number = 3;

  constructor(private socketService: SocketService, private router: Router, private cpService: ColorPickerService) {
    this.canvasData = this.socketService.gameState.game.canvasData;
    this.activeWord = this.socketService.gameState.game.activeWord;
    this.activeTurnSocketId = this.socketService.gameState.game.activeTurnSocketId;

    this.gameStateSubscription = this.socketService.createGameStateObservable().subscribe((gameState:any) => {
      console.log("canvas component line 42");
      console.log(gameState);
      this.activeWord = gameState.game.activeWord;
      this.activeTurnSocketId = gameState.game.activeTurnSocketId;
    });

    if(this.socketService.subjectXY !== undefined || this.socketService.subjectXY !== null){
      this.socketXYSubscription = this.socketService.subjectXY.subscribe(xy => {
        xy = JSON.parse(xy);
        this.drawOnCanvas(xy.prevPos, xy.currentPos, xy.color, xy.size);
      });
    }

  }

  ngOnInit() {

  }

  public onChangeColorHex8(color: string) {
    const hsva = this.cpService.stringToHsva(color, true);
    if (hsva) {
      this.selectedColor = this.cpService.outputFormat(hsva, 'hex', null);
    }
  }

  public onChangeSize(event: any){
    this.selectedSize = event.value;
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
    const canvasEl = this.canvas.nativeElement;
    canvasEl.width = this.canvasDiv.nativeElement.offsetWidth;
    canvasEl.height = this.canvasDiv.nativeElement.offsetHeight;
  }

  private cx: CanvasRenderingContext2D;

  public ngAfterViewInit() {

    // get the context
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');
    // set the width and height
    canvasEl.width = this.canvasDiv.nativeElement.offsetWidth;
    canvasEl.height = this.canvasDiv.nativeElement.offsetHeight;


    // set some default properties about the line
    this.cx.lineWidth = this.selectedSize;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = this.selectedColor;

    this.captureEvents(canvasEl);

    for(let i = 0; i < this.canvasData.length; i++){
      let toDraw = JSON.parse(this.canvasData[i]);
      this.drawOnCanvas(toDraw.prevPos, toDraw.currentPos, toDraw.color, toDraw.size);
    }
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {

    // this will capture all mousedown events from teh canvas element
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

        const rect = canvasEl.getBoundingClientRect();

        // previous and current position with the offset
        const prevPos = {
          x: res[0].clientX - rect.left,
          y: res[0].clientY - rect.top
        };

        const currentPos = {
          x: res[1].clientX - rect.left,
          y: res[1].clientY - rect.top
        };

        this.socketService.subjectXY.next({
          prevPos,
          currentPos,
          color: this.selectedColor,
          size: this.selectedSize
        });
        this.drawOnCanvas(prevPos, currentPos, this.selectedColor, this.selectedSize);
      });
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
