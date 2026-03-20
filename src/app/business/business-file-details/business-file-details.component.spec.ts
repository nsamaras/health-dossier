import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFileDetailsComponent } from './business-file-details.component';

describe('BusinessFileDetailsComponent', () => {
  let component: BusinessFileDetailsComponent;
  let fixture: ComponentFixture<BusinessFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
