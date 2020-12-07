import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../service.service';
import { from } from 'rxjs';
import { PageEvent } from '@angular/material';
import { finalize } from 'rxjs/operators';

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
//   {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
//   {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
//   {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
//   {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
//   {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
//   {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
//   {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
//   {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
//   {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
// ];

@Component({
  selector: 'app-processed-orders',
  templateUrl: './processed-orders.component.html',
  styleUrls: ['./processed-orders.component.css']
})
export class ProcessedOrdersComponent {
  displayedColumns: string[] = ['id', 'payment_url', 'created_at', 'subtotal_price',
                                'customer', 'financial_status', 'title',
                                'payment_gateway_names'];
  // dataSource = ELEMENT_DATA;
  orders = [];
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  currentPage = 0;
  // MatPaginator Output
  pageEvent: PageEvent;
  pageInfo = '';
  nextUrl = '';
  urlStack = [ '' ];
  loading = false;


  constructor( public service: ServiceService ) {
    this.getOrdersCount();
    this.getOrders();
  }

  getOrders() {
    this.loading = true;
    this.nextUrl = this.urlStack[this.currentPage];
    this.service.getOrdersPagination({ pageSize: this.pageSize, nextUrl: this.nextUrl })
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((response: any) => {
        const link = response.headers.link;
        if( link ) {
          this.nextUrl = link.replace('<https://unlikelyflorist-com.myshopify.com', '').split('>;')[0].trim();
        }
        this.urlStack[this.currentPage + 1] = this.nextUrl;
        // this.manageUrlStack( this.nextUrl );
        const orders = JSON.parse(response.body).orders || [];
        let arrIds = [];
        this.orders = orders.map((item) => {
          arrIds.push(item.id); 
          return {
            id: item.id,
            created_at: item.created_at,
            subtotal_price: item.subtotal_price,
            customer: 'custom',
            financial_status: item.financial_status,
            title: item.line_items[0][`title`],
            payment_gateway_names: item.payment_gateway_names,
            order_status_url: item.order_status_url
          };
        });
        this.service.fetchPaymentDeatils(arrIds).subscribe((data: any)=>{
          this.orders.forEach((item) => {
            data.result.forEach(element => {
              if( element.orderId == item.id ) {
                item['payment_url'] = 'https://dashboard.stripe.com/test/payments/' + element.stripePaymentId
              }
            });
          } );
        });
      });
  }

  getOrdersCount() {
    this.service.getOrdersCount().subscribe( (response: any) => {
      const count = JSON.parse(response.body).count;
      this.length = count;
    } );
  }

  manageUrlStack( nextUrl ) {
    if (this.currentPage === 0) {
      this.urlStack[this.currentPage] = '';
    } else {
      this.urlStack[this.currentPage] = this.nextUrl;
    }
  }

  setPageSizeOptions(setPageSizeOptionsInput: any) {
    if (setPageSizeOptionsInput) {
      if ( this.pageSize !== setPageSizeOptionsInput.pageSize ) {
        this.currentPage = 0;
      } else {
        this.currentPage = setPageSizeOptionsInput.pageIndex;
      }
      this.pageSize = setPageSizeOptionsInput.pageSize;
      this.getOrders();
      this.getOrdersCount();
    }
  }

}
