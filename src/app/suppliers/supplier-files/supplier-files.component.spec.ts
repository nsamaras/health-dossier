import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFilesComponent } from './supplier-files.component';

describe('SupplierFilesComponent', () => {
  let component: SupplierFilesComponent;
  let fixture: ComponentFixture<SupplierFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupplierFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
