import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionService {
  customCollectionId;

  constructor(private http: HttpClient) { }

  getCustomCollections() {
    const shopUrl = '/admin/api/2020-07/custom_collections.json';
    const url = `../api/shopifyget?url=${ encodeURIComponent(shopUrl) }`;
    return this.http.get(url);
  }

  createCustomCollection() {
    const url = '../api/shopifypost';
    const data = {
      url: '/admin/api/2020-07/custom_collections.json',
      data: {
        custom_collection: {
          title: `subscription-app`
        }
      }
    };
    return this.http.post(url, data);
  }

  moveProductToCollection(productId) {
    if (!productId || !this.customCollectionId) {
      return of('error');
    }
    const url = '../api/shopifypost';
    const data = {
      url: '/admin/api/2020-04/collects.json',
      data: {
        collect: {
          product_id: productId,
          collection_id: this.customCollectionId
        }
      }
    };
    return this.http.post(url, data);
  }

}
