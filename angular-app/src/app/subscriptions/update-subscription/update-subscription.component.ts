import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CreateSubscriptionComponent } from '../create-subscription/create-subscription.component';
import { ServiceService } from 'src/app/service.service';
import { MatSnackBar } from '@angular/material';
import { forkJoin } from 'rxjs';
import { take, finalize } from 'rxjs/operators';
import { CollectionService } from 'src/app/collection.service';

@Component({
  selector: 'app-update-subscription',
  templateUrl: './update-subscription.component.html',
  styleUrls: ['./update-subscription.component.css']
})
export class UpdateSubscriptionComponent extends CreateSubscriptionComponent implements OnInit {
  @Output() parentEvent = new EventEmitter();
  @Input() productId; // used for edit
  product: any = {};
  prodVariants = [];
  prodVariantPositions = {};
  // subscription = new FormGroup({
  //   title: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/)])),
  // });

  constructor(
    service: ServiceService,
    collectionService: CollectionService,
    snackBar: MatSnackBar) {
    super(service, collectionService, snackBar);
  }

  ngOnInit() {
    this.fetchProduct();
    this.fetchSubFrequencyList();
    this.fetchSubDurationList();
  }

  fetchProduct() {
    this.loading = true;
    this.service.fetchProduct(this.productId).subscribe((response: any) => {
      this.product = response.product;
      this.subscription.controls.title.setValue(this.product.title);
      this.subscription.controls.available.setValue(this.product.tags);
      this.prodVariants = this.product.variants.map((element) => {
        return {
          id: element.id,
          title: element.title,
          price:
            new FormControl(element.price, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')])),
          subscriptionFrequencyId:
            new FormControl('', Validators.compose([Validators.required])),
          subscriptionDurationId:
            new FormControl('', Validators.compose([Validators.required]))
        };
      });
      this.fetchVariantMetaFields();
    });
  }

  fetchVariantMetaFields() {
    const $observables = [];
    this.prodVariantPositions = {};
    this.prodVariants.forEach( (elm, index) => {
      this.prodVariantPositions[elm.id] = index;
      $observables.push(this.service.fetchVariantMetafield(this.productId, elm.id));
    } );

    forkJoin($observables).pipe( finalize(() => { this.loading = false; }) ).subscribe((data) => {
      data.forEach( (elm) => {
        const elmJson = JSON.parse(elm);
        // const metaFeild = elmJson.metafields[0];
        elmJson.metafields.forEach( (metaFeild) => {
          if ( metaFeild.key === 'subscriptionFrequencyId' ) {
            this.prodVariants[ this.prodVariantPositions[metaFeild.owner_id] ][`subscriptionFrequencyId`]
            .setValue( Number( metaFeild.value));
            this.prodVariants[ this.prodVariantPositions[metaFeild.owner_id] ][`metaFieldIdFrequency`] = Number( metaFeild.id);
          }

          if ( metaFeild.key === 'subscriptionDurationId' ) {
            this.prodVariants[ this.prodVariantPositions[metaFeild.owner_id] ][`subscriptionDurationId`]
            .setValue( Number( metaFeild.value));
            this.prodVariants[ this.prodVariantPositions[metaFeild.owner_id] ][`metaFieldIdDuration`] = Number( metaFeild.id);
          }

        } );
      } );
    });
  }

  updateVariant(variant) {
    const variantId = variant.id;
    const metaFieldIdFrequency = variant.metaFieldIdFrequency;
    const metaFieldIdDuration = variant.metaFieldIdDuration;
    const customVariant = this.product.variants.find((elm) => elm.id === variantId);
    customVariant.price = variant.price.value;
    // this sku is used to identify subscription variant in order. This is essential in case of multiple products are in order.
    customVariant.sku = 'subscription-app-sku';
    this.loading = true;
    const $udpateVariantPrice = this.service.updateVariantPrice(variantId, customVariant);

    // update metafield frequencyId
    const metaFeildFrequency = {
      id: metaFieldIdFrequency,
      value: variant.subscriptionFrequencyId.value,
      value_type: `string`
    };
    const $updateMetafieldFrequency = this.service.updateMetafield(metaFieldIdFrequency, metaFeildFrequency);

    // update metafield durationId
    const metaFeildDuration = {
      id: metaFieldIdDuration,
      value: variant.subscriptionDurationId.value,
      value_type: `string`
    };
    const $updateMetafieldDuration = this.service.updateMetafield(metaFieldIdDuration, metaFeildDuration);
    forkJoin($udpateVariantPrice, $updateMetafieldFrequency, $updateMetafieldDuration)
      .pipe(finalize(() => { this.loading = false; }))
      .subscribe((data) => {
        this.openSnackBar('Variant updated successfully!', 'UPDATE');
      });
  }

  updateProdutct() {
    const paramProduct = {
      id: this.productId,
      title: this.subscription.controls.title.value,
      tags: this.subscription.controls.available.value
    };
    this.loading = true;
    this.service.updateProduct(this.productId, paramProduct).subscribe((prodResponse: any) => {
      if (this.prodImageVase64String && this.prodImageName) {
        const productId = prodResponse.body.product.id;
        this.updateProductImage(productId).pipe( finalize( () => { this.loading = false; } ) ).subscribe((imageResponse) => {
          this.openSnackBar('Product updated successfully!', 'UPDATE');
          this.gotToListing();
        });
      } else {
        this.loading = false;
        this.openSnackBar('Product updated successfully!', 'UPDATE');
        this.gotToListing();
      }
      this.moveProductInCollection(this.productId);
    });
  }

}
