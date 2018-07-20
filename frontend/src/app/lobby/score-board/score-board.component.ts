import { Component, OnInit } from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css']
})
export class ScoreBoardComponent implements OnInit {

  displayedColumns: string[] = ['position', 'name', 'score'];
  dataSource = [];

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.dataSource = this.socketService.endGameScoreBoard;
  }

  endGame() {
    this.router.navigate(['/lobby/rooms']);
  }
}
