import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from "@angular/material";
import {AuthService} from "../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, tap} from "rxjs/operators";
import {throwError} from "rxjs/internal/observable/throwError";


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}
  ]
})
export class LobbyComponent implements OnInit, OnDestroy {

  constructor(private authService : AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    if(this.authService.checkJWT()){
      this.authService.getUser()
        .pipe(catchError( error=>{
          this.router.navigate(['/lobby/login']);
          return throwError(error);
        }))
        .subscribe( ()=>{
          console.log('?');
          this.router.navigate(['./rooms'], { relativeTo: this.route });
        });
    }else{
      this.router.navigate(['/lobby/login']);
    }

  }

  ngOnDestroy() {
  }

}
