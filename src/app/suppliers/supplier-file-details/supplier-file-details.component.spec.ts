import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFileDetailsComponent } from './supplier-file-details.component';

describe('SupplierFileDetailsComponent', () => {
  let component: SupplierFileDetailsComponent;
  let fixture: ComponentFixture<SupplierFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
