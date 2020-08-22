import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ServiceService } from 'src/app/service.service';

@Component({
  selector: 'app-list-subscriptions',
  templateUrl: './list-subscriptions.component.html',
  styleUrls: ['./list-subscriptions.component.css']
})
export class ListSubscriptionsComponent implements OnInit {
  displayedColumns: string[] = ['title', 'available', 'date', 'action'];
  products = [];
  @Output() parentEvent = new EventEmitter();

  constructor( private service: ServiceService ) { }

  ngOnInit() {
    this.fetchSubscriptionProducts();
  }

  fetchSubscriptionProducts() {
    this.service.getSubscriptionsProducts().subscribe( (data: any) => {
      this.products = data.products;
    } );
  }

  updateProduct( productId ) {
    this.parentEvent.emit( { message : { viewMode: 'UPDATE', data: productId } } );
  }

  deleteProduct( productId ) {

  }

}
