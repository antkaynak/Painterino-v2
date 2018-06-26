import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from "@angular/material";


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
