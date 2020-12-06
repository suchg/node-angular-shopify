import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribedUsersComponent } from './subscribed-users.component';

describe('SubscribedUsersComponent', () => {
  let component: SubscribedUsersComponent;
  let fixture: ComponentFixture<SubscribedUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubscribedUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
