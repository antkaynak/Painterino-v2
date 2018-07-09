import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from "../../services/socket.service";
import {Subscription} from "rxjs/internal/Subscription";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  userList: any = [];
  userListSubscription: Subscription;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.userList = this.socketService.initUserList;
    this.userListSubscription = this.socketService.getActiveUsers().subscribe(data=>{
      console.log(data);
      this.userList = data;
    });
  }

  ngOnDestroy() {
    if(this.userListSubscription != null){
      this.userListSubscription.unsubscribe();
    }
  }

}
