import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ServiceService } from '../../service.service';
import { MatAccordion, MatChipInputEvent, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-variant-setting',
  templateUrl: './subscription-options.component.html',
  styleUrls: ['./subscription-options.component.css']
})
export class SubscriptionOptionsComponent implements OnInit {
  @ViewChild(MatAccordion, { static: false }) accordion: MatAccordion;
  productsSubscription = [];
  variantAdded = 1;
  variants = [];
  loading = false;

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  options = {
    option1Title: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ !@#$%-^&*()]+$/)])),
    option2Title: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ !@#$%-^&*()]+$/)])),
    option3Title: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ !@#$%-^&*()]+$/)])),
    option1: [],
    option2: [],
    option3: []
  };

  constructor(
    private service: ServiceService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fetchVariantsMaster();
    this.fetchOptionsMaster();
  }

  addOption(optionType) {
    this.options[optionType].push({
      name: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ ]*$/)])),
      variantKey: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%-^&*()]+$/)])),
      note: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ !@#$%-^&*()]+$/)]))
    });
  }

  removeOption(optionType, i) {
    const option = this.options[optionType][i];

    if (option) {
      this.options[optionType].splice(i, 1);
    }
  }

  validateFrom() {
    let valid = true;
    const checkOptionsValid = (optionName) => {
      let optionIsValid = true;
      this.options[optionName].forEach((option) => {
        if (optionIsValid) {
          optionIsValid = option.name.valid && option.variantKey.valid;
        }
      });
      return optionIsValid;
    };

    valid = this.options.option1Title.valid &&
      this.options.option2Title.valid &&
      this.options.option3Title.valid &&
      checkOptionsValid('option1') &&
      checkOptionsValid('option2') &&
      checkOptionsValid('option3');
    return valid;
  }

  remove(i, option): void {
    const index = this.options[i].indexOf(option);

    if (index >= 0) {
      this.options[i].splice(index, 1);
    }
  }

  fetchVariantsMaster() {
    this.service.fetchVariantMaster().subscribe((data: any) => {
      const options = data.result;
      options.forEach(element => {
        if (element.optionTitle && this.options[element.optionTitle]) {
          this.options[element.optionTitle].push({
            name: new FormControl(element.variantTitle.trim(),
              Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ ]*$/)])),
            variantKey: new FormControl(element.variantKey,
              Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%-^&*()]+$/)])),
            note: new FormControl(element.note,
              Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z0-9_ !@#$%-^&*()]+$/)]))
          });
        }
      });
    });
  }

  fetchOptionsMaster() {
    this.service.fetchOptionsMaster().subscribe( (data: any) => {
      data.result.forEach( (option) => {
        if (option.optionTitle === 'option1') {
          this.options.option1Title.setValue( option.optionDescription );
        }

        if (option.optionTitle === 'option2') {
          this.options.option2Title.setValue( option.optionDescription );
        }

        if (option.optionTitle === 'option3') {
          this.options.option3Title.setValue( option.optionDescription );
        }
      } );
    } );
  }

  updateVariantMaster() {

    if (!this.options.option1.length &&
      !this.options.option2.length &&
      !this.options.option3.length) {
      this.openSnackBar('Please add minimum one option to process!', 'ERROR');
      return;
    }

    if (!this.validateFrom()) {
      this.openSnackBar('Please enter valid values!', 'ERROR');
      return;
    }

    // this.loading = true;
    const options = {
      option1Title: this.options.option1Title.value,
      option2Title: this.options.option2Title.value,
      option3Title: this.options.option3Title.value,
      option1: [],
      option2: [],
      option3: []
    };

    this.options.option1.forEach( (option) => {
      const optionVal = {
        name: option.name.value,
        variantKey: option.variantKey.value,
        note: option.note.value
      };
      options.option1.push(optionVal);
    } );

    this.options.option2.forEach( (option) => {
      const optionVal = {
        name: option.name.value,
        variantKey: option.variantKey.value,
        note: option.note.value
      };
      options.option2.push(optionVal);
    } );

    this.options.option3.forEach( (option) => {
      const optionVal = {
        name: option.name.value,
        variantKey: option.variantKey.value,
        note: option.note.value
      };
      options.option3.push(optionVal);
    } );

    this.service.updateVariantMaster(options).subscribe((data) => {
      this.loading = false;
      if (data) {
        this.openSnackBar('Records updated successfully!', 'UPDATE');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

}
