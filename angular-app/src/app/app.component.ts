import { Component } from '@angular/core';
import { ServiceService } from './service.service';
import { CollectionService } from './collection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-app';
  constructor( private service: CollectionService ) {
    this.generateCustomCollection();
  }

  generateCustomCollection() {
    this.service.getCustomCollections().subscribe((data: any) => {
      const collections = JSON.parse(data.body).custom_collections;
      const customCollection = collections.find((element) => {
        return element.title === 'subscription-app';
      });

      if (customCollection) {
        this.service.customCollectionId = customCollection.id;
      } else {
        this.service.createCustomCollection().subscribe( (collectionData: any) => {
          let newCustomCollection;
          try {
            newCustomCollection = JSON.parse(collectionData.body);
          } catch (error) {
            newCustomCollection = collectionData.body;
          }
          this.service.customCollectionId = newCustomCollection.custom_collection.id;
        } );
      }
    });
  }
}
