import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDiscountSettingComponent } from './product-discount-setting.component';

describe('ProductDiscountSettingComponent', () => {
  let component: ProductDiscountSettingComponent;
  let fixture: ComponentFixture<ProductDiscountSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductDiscountSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductDiscountSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
