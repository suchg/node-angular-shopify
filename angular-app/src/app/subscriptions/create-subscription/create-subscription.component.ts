import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ServiceService } from 'src/app/service.service';
import { MatSnackBar } from '@angular/material';
import { CollectionService } from 'src/app/collection.service';

@Component({
  selector: 'app-create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.css']
})
export class CreateSubscriptionComponent implements OnInit {
  @Output() parentEvent = new EventEmitter();
  @Input() productId; // used for edit
  loading = false;
  prodImageVase64String = '';
  prodImageName = '';
  prodOptions = {
    option1: [],
    option2: [],
    option3: []
  };
  prodOptionColumns = [];
  variants = [];
  optionObjects = [];
  variantObjects = [];
  subFrequencyList = [];
  subDurationList = []; // [ { id: 1, name: 'name1' }, { id: 2, name: 'name2' }, { id: 3, name: 'name3' } ];
  // defaultSubscriptionFrequencyId = this.subFrequencyList[0].id;

  subscription = new FormGroup({
    title: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/)])),
    available: new FormControl('available'),
  });
  constructor(public service: ServiceService,
              public collectionService: CollectionService,
              public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fetchVariantMaster();
    this.fetchSubFrequencyList();
    this.fetchSubDurationList();
  }

  fetchSubFrequencyList() {
    this.service.fetchSubFrequencyList().subscribe((data: any) => {
      this.subFrequencyList = data.result.map( (frequency) => {
        return {
          id: frequency.id,
          name: frequency.title,
          frequency: frequency.frequency
        };
      } );
    });
  }

  fetchSubDurationList() {
    this.service.fetchSubDurationList().subscribe((data: any) => {
      this.subDurationList = data.result.map( (duration) => {
        return {
          id: duration.id,
          name: duration.title,
          duration: duration.duration
        };
      } );
    });
  }

  // create product section
  createSubscription() {
    const product = {
      title: this.subscription.controls.title.value,
      body_html: `<strong>Good snowboard!</strong>`,
      vendor: `unlikelyflorist.com`,
      product_type: `subscription-app`,
      tags: this.subscription.controls.available.value
    };

    this.generateVariantsObject();
    product[`options`] = this.optionObjects;
    product[`variants`] = this.variantObjects;

    this.loading = true;
    this.service.newProduct(product).subscribe((prodResponse: any) => {
      const productId = prodResponse.body.product.id;
      if (this.prodImageVase64String && this.prodImageName) {
        this.updateProductImage(productId).subscribe( (imageResponse) => {
          this.loading = false;
          this.openSnackBar('Product created successfully!', 'CREATE');
          this.gotToListing();
        });
      } else {
        this.loading = false;
        this.openSnackBar('Product created successfully!', 'CREATE');
        this.gotToListing();
      }
      this.moveProductInCollection( productId );
    });
  }

  moveProductInCollection(productId) {
    this.collectionService.moveProductToCollection(productId).subscribe((data) => {
      debugger;
    });
  }

  updateProductImage( productId ) {
    const paramProdId = productId || this.productId;
    const image = {
      position: 1,
      attachment: this.prodImageVase64String,
      filename: this.prodImageName
    };
    return this.service.uploadProductImage(paramProdId, image);
  }

  gotToListing() {
    this.parentEvent.emit({ message: { viewMode: 'LIST', data: '' } });
  }

  onUploadChange(evt: any) {
    const file = evt.target.files[0];
    this.prodImageName = file.name;
    if (file) {
      const reader = new FileReader();

      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
    }
  }

  handleReaderLoaded(e) {
    this.prodImageVase64String = btoa(e.target.result);
  }

  fetchVariantMaster() {
    this.service.fetchVariantMaster().subscribe((response: any) => {
      const options = response.result;
      options.forEach(element => {
        if ( element.optionTitle && this.prodOptions[ element.optionTitle ] ) {
          const maintainColumns = !this.prodOptionColumns.includes( element.optionTitle ) &&
                                  this.prodOptionColumns.push( element.optionTitle );
          this.prodOptions[ element.optionTitle ].push( {name: element.variantKey.trim()} );
        }
      });
      this.generateVariantSet();
      this.generateOptionObject();
    });
  }

  generateVariantSet() {
    this.variants = [];
    let variant = {};

    this.prodOptions.option1.forEach(option1 => {
      variant = {};
      if (this.prodOptions.option2.length) {
        this.prodOptions.option2.forEach(option2 => {
          variant = {};
          if (this.prodOptions.option3.length) {
            this.prodOptions.option3.forEach(option3 => {
              variant = {};
              variant[`option1`] = option1.name;
              variant[`option2`] = option2.name;
              variant[`option3`] = option3.name;
              variant[`price`] =
              new FormControl(0, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]));
              variant[`subscriptionFrequencyId`] =
              new FormControl(0, Validators.compose([Validators.required]));
              variant[`subscriptionDurationId`] =
              new FormControl(0, Validators.compose([Validators.required]));
              variant[`inventory_policy`] = 'continue';
              this.variants.push(variant);
            });
          } else {
            variant[`option1`] = option1.name;
            variant[`option2`] = option2.name;
            variant[`price`] =
            new FormControl(0, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]));
            variant[`subscriptionFrequencyId`] =
            new FormControl(0, Validators.compose([Validators.required]));
            variant[`subscriptionDurationId`] =
            new FormControl(0, Validators.compose([Validators.required]));
            variant[`inventory_policy`] = 'continue';
            this.variants.push(variant);
          }
        });
      } else {
        variant[`option1`] = option1.name;
        variant[`price`] =
        new FormControl(0, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]));
        variant[`subscriptionFrequencyId`] =
        new FormControl(0, Validators.compose([Validators.required]));
        variant[`subscriptionDurationId`] =
        new FormControl(0, Validators.compose([Validators.required]));
        variant[`inventory_policy`] = 'continue';
        this.variants.push(variant);
      }

    });

    this.generateDefaultVariant();
  }

  generateDefaultVariant() {
    const firstVariant = { ...this.variants[0] };
    firstVariant.price = new FormControl(0, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]));
    firstVariant.subscriptionFrequencyId =
    new FormControl(0, Validators.compose([Validators.required]));
    firstVariant.subscriptionDurationId =
    new FormControl(0, Validators.compose([Validators.required]));
    if (firstVariant.option1) {
      firstVariant.option1 = 'DEFAULT';
    }
    if (firstVariant.option2) {
      firstVariant.option2 = 'DEFAULT';
    }
    if (firstVariant.option3) {
      firstVariant.option3 = 'DEFAULT';
    }
    this.variants.unshift(firstVariant);
  }

  generateOptionObject() {
    if (this.prodOptions.option1 && this.prodOptions.option1.length) {
      this.optionObjects.push(
        {
          name: `option1`,
          values: this.prodOptions.option1
        }
      );
    }

    if (this.prodOptions.option2 && this.prodOptions.option2.length) {
      this.optionObjects.push(
        {
          name: `option2`,
          values: this.prodOptions.option2
        }
      );
    }

    if (this.prodOptions.option3 && this.prodOptions.option3.length) {
      this.optionObjects.push(
        {
          name: `option3`,
          values: this.prodOptions.option3
        }
      );
    }
  }

  generateVariantsObject() {
    this.variantObjects = this.variants.map( (variant) => {
      const returnObject = {
        inventory_policy: 'continue',
        price: variant.price.value,
        metafields: [{
          key: `subscriptionFrequencyId`,
          value: `${variant.subscriptionFrequencyId.value || '1'}`,
          value_type: `string`,
          namespace: `global`
        },
        {
          key: `subscriptionDurationId`,
          value: `${variant.subscriptionDurationId.value || '1'}`,
          value_type: `string`,
          namespace: `global`
        }
        ],
        sku: 'subscription-app-sku'
      };

      variant.option1 && (returnObject['option1'] = variant.option1);
      variant.option2 && (returnObject['option2'] = variant.option2);
      variant.option3 && (returnObject['option3'] = variant.option3);

      return returnObject;
    } );
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

}
