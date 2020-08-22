import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../service.service';
import { forkJoin } from 'rxjs';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-product-discount-setting',
  templateUrl: './product-discount-setting.component.html',
  styleUrls: ['./product-discount-setting.component.css']
})
export class ProductDiscountSettingComponent implements OnInit {
  priceRules = [];
  priceRulId = 652398624811;
  discounts = [];
  toppings = new FormControl();
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  products = [];
  productOptions = [];
  selectionArray = [];
  loading = false;
  productCodeMapping = {};
  newCodeRule = new FormGroup({
    code: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/)])),
    products: new FormControl('', Validators.compose([Validators.required])),
    priceRuleValue: new FormControl(0, Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]))
  });
  viewMode = 'LISTING';

  constructor(private service: ServiceService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fetchPriceRules();
    this.fetchProducts();
  }

  fetchPriceRules() {
    this.loading = true;
    this.service.getPriceRules().subscribe((data: any) => {
      this.priceRules = data.price_rules;
      this.selectionArray = [];
      this.priceRules.forEach((priceRule: any) => {
        this.selectionArray.push(
          {
            priceRule: {
              id: priceRule.id,
              entitledVariantIds: priceRule.entitled_variant_ids,
              value: priceRule.value,
              products: new FormControl(priceRule.entitled_variant_ids, Validators.compose([Validators.required])),
              priceRuleValue: new FormControl(-priceRule.value,
                Validators.compose([Validators.required, Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')]))
            },
            discount: {
              code: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()]+$/)])),
              id: new FormControl('')
            }
          });
      });
      this.fetchDescounts();
    });
  }

  fetchDescounts() {
    const arrPromises = [];
    this.priceRules.forEach(priceRule => {
      const observable = this.service.getDisocounts(priceRule.id);
      arrPromises.push(observable);
    });
    forkJoin(arrPromises).subscribe((data) => {
      this.discounts = data.map((item) => {
        this.pushDiscountInSelectionArray(item.discount_codes[0]);
        return item.discount_codes[0];
      });
      this.loading = false;
    });
  }

  fetchProducts() {
    this.service.getSubscriptionsProducts().subscribe((data: any) => {
      this.products = data.products;
      this.products.forEach(product => {
        const productTitle = product.title;
        product.variants.forEach(variant => {
          this.productOptions.push({ id: variant.id, title: `${productTitle}-${variant.title}` });
        });
      });
    });
  }

  pushDiscountInSelectionArray(discount: any) {
    this.selectionArray.forEach((selection, index) => {
      if (discount && selection.priceRule.id === discount.price_rule_id) {
        this.selectionArray[index].discount.code.setValue(discount.code);
        this.selectionArray[index].discount.id.setValue(discount.id);
      }
    });
  }

  updateDescount(index) {
    const selectedRow = this.selectionArray[index];

    if (selectedRow.discount.code.invalid ||
      selectedRow.priceRule.priceRuleValue.invalid ||
      selectedRow.priceRule.products.invalid) {
      return;
    }

    let code = selectedRow.discount.code.value;
    const percentage = selectedRow.priceRule.priceRuleValue.value;
    const products = selectedRow.priceRule.products.value;
    const codeId = selectedRow.discount.id.value;
    const priceRuleId = selectedRow.priceRule.id;

    if (!code.includes('susbcriptionapp')) {
      code += 'susbcriptionapp';
    }

    const $updatePriceRule = this.service.updatePriceRule(priceRuleId, {
      id: priceRuleId,
      value: `-${percentage}`,
      entitled_variant_ids: products,
      title: code
    });

    const $updateDiscount = this.service.updateDiscount(codeId, priceRuleId, {
      id: codeId,
      code
    });

    this.loading = true;
    forkJoin($updateDiscount, $updatePriceRule).subscribe((data) => {
      this.fetchPriceRules();
      const productCodeMapping = this.getProdCodeMapping();
      this.openSnackBar('Discount update successfully!!', 'UPDATE');
      this.service.updateDiscountProductMapping(productCodeMapping).subscribe((data) => {
        console.log('Discount mapping updated successfully!!');
      });
    });

  }

  getProdCodeMapping() {
    this.selectionArray.forEach((selection, index) => {
      const selectedRow = this.selectionArray[index];
      const code = selectedRow.discount.code.value;
      const percentage = selectedRow.priceRule.priceRuleValue.value;
      const products = selectedRow.priceRule.products.value;
      this.productCodeMapping[code] = products;
    });
    return this.productCodeMapping;
  }

  createDiscount() {
    const code = this.newCodeRule.controls.code.value;
    const products = this.newCodeRule.controls.products.value;
    const priceRuleValue = this.newCodeRule.controls.priceRuleValue.value;
    const priceRule = {
      "value_type": "percentage",
      "value": `-${priceRuleValue}`,
      "customer_selection": "all",
      "target_type": "line_item",
      "target_selection": "entitled",
      "allocation_method": "across",
      "allocation_limit": null,
      "once_per_customer": false,
      "usage_limit": null,
      "starts_at": new Date(), // "2020-06-29T09:30:38-04:00",
      "ends_at": null,
      "created_at": "2020-06-29T09:31:01-04:00",
      "updated_at": "2020-07-07T06:45:47-04:00",
      "entitled_product_ids": [],
      "entitled_variant_ids": products,
      "entitled_collection_ids": [],
      "entitled_country_ids": [],
      "prerequisite_product_ids": [],
      "prerequisite_variant_ids": [],
      "prerequisite_collection_ids": [],
      "prerequisite_saved_search_ids": [],
      "prerequisite_customer_ids": [],
      "prerequisite_subtotal_range": null,
      "prerequisite_quantity_range": null,
      "prerequisite_shipping_price_range": null,
      "prerequisite_to_entitlement_quantity_ratio": {
        "prerequisite_quantity": null,
        "entitled_quantity": null
      },
      "title": `${code}susbcriptionapp`,
    };

    const discount = {
      "code": `${code}susbcriptionapp`
    };

    this.loading = true;
    this.service.createCode({ priceRule, discount }).subscribe((response) => {
      this.viewMode = 'LISTING';
      this.fetchPriceRules();
      this.openSnackBar('Discount created successfully!!', 'CREATE');
    });
  }

  deleteDescount(index) {
    const selectedRow = this.selectionArray[index];
    const priceRuleId = selectedRow.priceRule.id;
    const codeId = selectedRow.discount.id.value;
    const $deleteDiscount = this.service.deleteDiscountCode(priceRuleId, codeId);
    const $deletePriceRule = this.service.deletePriceRule(priceRuleId);

    this.loading = true;
    const subscriptionArray = [];
    if (codeId && priceRuleId) {
      subscriptionArray.push($deleteDiscount);
      subscriptionArray.push($deletePriceRule);
    } else if (priceRuleId) {
      subscriptionArray.push($deletePriceRule);
    }
    forkJoin(subscriptionArray).subscribe((data) => {
      this.openSnackBar('Discount deleted successfully!!', 'DELETE');
      this.fetchPriceRules();
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
    });
  }

}
