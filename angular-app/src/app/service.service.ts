import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private http: HttpClient) { }

  createCode( data ) {
    const url = '../api/createDiscount';
    return this.http.post( url, data );
  }

  deleteDiscountCode( priceRuleId, discountId ) {
    const url = `../api/discount?priceRuleId=${priceRuleId}&discountId=${discountId}`;
    return this.http.delete( url );
  }

  deletePriceRule( priceRuleId ) {
    const url = `../api/priceRule?priceRuleId=${priceRuleId}`;
    return this.http.delete( url );
  }

  getOrders( ) {
    const url = `../api/orders`;
    return this.http.get(url);
  }

  getOrdersPagination( pagination ) {
    const nextUrl = pagination.nextUrl;
    const pageSize = pagination.pageSize;
    let restUrl = '../api/shopifyget';
    let url = `/admin/api/2020-04/orders.json?financial_status=paid&source_name=subscription-app&limit=${pageSize}`;
    if (nextUrl) {
      url = nextUrl;
    }
    restUrl += `?url=${encodeURIComponent(url)}`;
    return this.http.get(restUrl);
  }

  getOrdersCount() {
    const url = `/admin/api/2020-07/orders/count.json?financial_status=paid&source_name=subscription-app`;
    const restUrl = `../api/shopifyget?url=${encodeURIComponent(url)}`;
    return this.http.get(restUrl);
  }

  getSubscriptionsProducts() {
    return this.http.get('../api/products-subscription');
  }

  updateVariants(productId: any, product: any) {
    const url = `../api/products-variants`;
    return this.http.post(url, { product, productId: `${productId}` }).subscribe((data) => {
      console.log(data);
    });
  }

  getPriceRules() {
    const url = `../api/pricerules`;
    return this.http.get(url);
  }

  getDisocounts(priceRuleId) {
    const url = `../api/discounts?priceRuleId=${priceRuleId}`;
    return this.http.get(url);
  }

  updatePriceRule(ruleId: any, priceRule: any) {
    const url = `../api/updatePriceRule`;
    return this.http.put( url, {ruleId, priceRule} );
  }

  updateDiscount(discountId: any, ruleId: any, discount: any) {
    const url = `../api/updateDiscount`;
    return this.http.put( url, {discountId, ruleId, discount} );
  }

  updateDiscountProductMapping(productCodeMapping: any) {
    const url = `../api/discountProductMapping`;
    return this.http.put( url, {productCodeMapping} );
  }

  updateVariantMaster( options ) {
    const url = `../api/updateVariantsMaster`;
    return this.http.post( url, {options} );
  }

  fetchVariantMaster() {
    const url = `../api/variantsMaster`;
    return this.http.get( url );
  }

  fetchOptionsMaster() {
    const url = `../api/optionsMaster`;
    return this.http.get( url );
  }

  uploadProductImage( productId, image ) {
    const url = `../api/updateProductImage`;
    return this.http.post( url, {productId, image} );
  }

  newProduct(product) {
    const url = `../api/product`;
    return this.http.post( url, { product } );
  }

  fetchProduct(productId) {
    const url = `../api/product?productId=${productId}`;
    return this.http.get(url);
  }

  updateVariantPrice(variantId, variant) {
    const url = '../api/variantPrice';
    return this.http.post(url, { variantId, variant });
  }

  updateProduct(productId, product) {
    const url = '../api/updateProduct';
    return this.http.post(url, { productId, product });
  }

  fetchVariantMetafield(productId, variantId) {
    const url = `../api/variantMetafield?productId=${productId}&variantId=${variantId}`;
    return this.http.get(url);
  }

  updateMetafield( metafieldId, metaField ) {
    const url = '../api/updateMetafield';
    return this.http.post(url, { metafieldId, metaField });
  }

  fetchSubFrequencyList() {
    const url = `../api/frequencyMaster`;
    return this.http.get(url);
  }

  fetchSubDurationList() {
    const url = `../api/durationMaster`;
    return this.http.get(url);
  }

  fetchPaymentDeatils(orderIds) {
    let strIds = orderIds.join(', ');
    const url = `../api/paymentDeatils?orderIds=${strIds}`;
    return this.http.get(url);
  }

}
