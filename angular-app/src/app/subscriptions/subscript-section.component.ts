import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-subscript-section',
  templateUrl: './subscript-section.component.html',
  styleUrls: ['./subscript-section.component.css']
})
export class SubscriptSectionComponent implements OnInit {
  viewMode = 'LIST';
  selectedProductId;
  constructor() { }

  ngOnInit() {
  }

  onChildEvent($event) {
    if ($event.message.viewMode) {
      this.viewMode = $event.message.viewMode;
      this.selectedProductId = $event.message.data;
    }
  }

}
