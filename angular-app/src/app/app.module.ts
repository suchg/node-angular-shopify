import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule, MatDividerModule, MatCardModule, MatTableModule,
         MatFormField, MatFormFieldModule, MatSelectModule, MatButtonToggleModule,
         MatSnackBarModule, MatExpansionModule, MatIcon, MatIconModule, MatInputModule,
         MatChipsModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule } from '@angular/material';
import { OrdersTabComponent } from './orders-tab/orders-tab.component';
import { ProcessedOrdersComponent } from './orders-tab/processed-orders/processed-orders.component';
import { ServiceService } from './service.service';
import { HttpClientModule } from '@angular/common/http';
import { SettingTabComponent } from './setting-tab/setting-tab.component';
import { SubscriptionOptionsComponent } from './setting-tab/subscription-options-setting/subscription-options.component';
import { ProductDiscountSettingComponent } from './setting-tab/product-discount-setting/product-discount-setting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubscriptSectionComponent } from './subscriptions/subscript-section.component';
import { CreateSubscriptionComponent } from './subscriptions/create-subscription/create-subscription.component';
import { ListSubscriptionsComponent } from './subscriptions/list-subscriptions/list-subscriptions.component';
import { UpdateSubscriptionComponent } from './subscriptions/update-subscription/update-subscription.component';
import { UpcomingOrdersComponent } from './orders-tab/upcoming-orders/upcoming-orders.component';
import { SubscribedUsersComponent } from './orders-tab/subscribed-users/subscribed-users.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OrdersTabComponent,
    ProcessedOrdersComponent,
    SettingTabComponent,
    SubscriptionOptionsComponent,
    ProductDiscountSettingComponent,
    SubscriptSectionComponent,
    CreateSubscriptionComponent,
    ListSubscriptionsComponent,
    UpdateSubscriptionComponent,
    UpcomingOrdersComponent,
    SubscribedUsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatDividerModule,
    MatCardModule,
    MatTableModule,
    MatButtonToggleModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatChipsModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  providers: [ ServiceService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
