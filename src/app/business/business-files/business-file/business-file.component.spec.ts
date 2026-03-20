import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFileComponent } from './business-file.component';

describe('BusinessFileComponent', () => {
  let component: BusinessFileComponent;
  let fixture: ComponentFixture<BusinessFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
