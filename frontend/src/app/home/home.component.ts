import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material";
import {AboutComponent} from "./about/about.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  onPlay() {
    this.router.navigate(['/lobby/login']);
  }

  onAbout() {
    this.dialog.closeAll();
    this.dialog.open(AboutComponent, {
      width: '500px',
    });
  }
}
