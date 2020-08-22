import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../orders.service';
import { PageEvent } from '@angular/material';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-upcoming-orders',
  templateUrl: './upcoming-orders.component.html',
  styleUrls: ['./upcoming-orders.component.css']
})
export class UpcomingOrdersComponent implements OnInit {
  displayedColumns: string[] = ['order', 'raised-by',
                                'product', 'total-price', 'order-to-place-date'];
  orders = [];
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  currentPage = 0;
  // MatPaginator Output
  pageEvent: PageEvent;
  loading = false;
  constructor( private orderService: OrdersService ) { }

  ngOnInit() {
    this.fetchUpcomingOrders();
  }

  fetchUpcomingOrders() {
    this.loading = true;
    const from = this.currentPage * this.pageSize;
    this.orderService.fetchUpcomingOrders( from, this.pageSize )
    .pipe( finalize( () => { this.loading = false; } ) )
    .subscribe( (response: any) => {
      const rows = response.upcomingOrders.result;
      const totalRecords = response.count.result[0].totalRecords;
      this.length = totalRecords;
      this.orders = rows.map((row) => {
        const orderData = JSON.parse(row.orderData);
        const lineItem = orderData.line_items[0];
        return {
          id: row.id,
          orderId: row.orderId,
          orderToPlaceDate: row.orderToPlaceDate,
          productId: row.productId,
          raisedBy: orderData.email,
          totalPrice: orderData.total_price,
          order_status_url: orderData.order_status_url,
          orderTitle: lineItem.title,
          paymentDoneBy: orderData.gateway
        };
      });
    } );
  }

  setPageSizeOptions(setPageSizeOptionsInput: any) {
    if (setPageSizeOptionsInput) {
      if ( this.pageSize !== setPageSizeOptionsInput.pageSize ) {
        this.currentPage = 0;
      } else {
        this.currentPage = setPageSizeOptionsInput.pageIndex;
      }
      this.pageSize = setPageSizeOptionsInput.pageSize;
      this.fetchUpcomingOrders();
    }
  }

}
