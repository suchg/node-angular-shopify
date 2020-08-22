import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateSubscriptionComponent } from './create-subscription.component';

describe('CreateUpdateSubscriptionComponent', () => {
  let component: CreateUpdateSubscriptionComponent;
  let fixture: ComponentFixture<CreateUpdateSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateUpdateSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUpdateSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
