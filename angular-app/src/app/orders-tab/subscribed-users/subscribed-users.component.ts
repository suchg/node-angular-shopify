import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';
import { PageEvent } from '@angular/material';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-subscribed-users',
  templateUrl: './subscribed-users.component.html',
  styleUrls: ['./subscribed-users.component.css']
})
export class SubscribedUsersComponent implements OnInit {

  displayedColumns: string[] = ['user', 'orderTitle', 'subscriptionStatus'];
  public orders = [];
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  currentPage = 0;
  // MatPaginator Output
  pageEvent: PageEvent;
  loading = false;
  subscribedUsers = [];
  selectedUserFilter = '';

  constructor( private orderService: OrdersService ) {
    // this.fetchSubscribedUsers();
  }

  ngOnInit() {
    this.fetchSubscribedUsers();
  }

  fetchSubscribedUsers() {
    this.orderService.fetchSubscription().subscribe( (data: any) => {
      // data.result.forEach(element => {
      //   this.orders.push( {user: element.userEmail, subscriptionStatus: element.subscriptionActive} );
      // });
      this.orders = data.result.map((row) => {
        const orderData = JSON.parse(row.orderData);
        const lineItem = orderData.line_items[0];
        return {
          orderId: row.orderId,
          user: row.userEmail,
          subscriptionStatus: row.subscriptionActive,
          orderTitle: lineItem.name
        };
      });
    } );
  }

  updateSubscriptionStatus(subscription: any){
    debugger;
    let status = (subscription.subscriptionStatus == 1) ? 0 : 1;
    this.orderService.updateSubscriptionStatus( subscription.orderId, status ).subscribe( (data) => {
      this.fetchSubscribedUsers();
    } );
  }


}
