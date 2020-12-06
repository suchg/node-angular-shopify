import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient) { }

  fetchUpcomingOrders(from, pageSize, selectedUserFilter) {
    const url = `../api/upcomingOrders?from=${from}&limit=${pageSize}&user=${selectedUserFilter}`;
    return this.http.get(url);
  }

  fetchSubscription() {
    const url = `../api/subscription`;
    return this.http.get(url);
  }

  updateSubscriptionStatus( subscriptionId, status ) {
    const url = '../api/updateSubscriptionStatus';
    return this.http.post(url, { subscriptionId, status });
  }

}
