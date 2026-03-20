import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessFilesComponent } from './business-files.component';

describe('BusinessFilesComponent', () => {
  let component: BusinessFilesComponent;
  let fixture: ComponentFixture<BusinessFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
