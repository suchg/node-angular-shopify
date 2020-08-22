import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingTabComponent } from './setting-tab.component';

describe('SettingTabComponent', () => {
  let component: SettingTabComponent;
  let fixture: ComponentFixture<SettingTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
