import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from "@angular/material";
import {Router} from "@angular/router";


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class LobbyComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // this.router.navigate(['/login']);
  }


}
