import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffFilesComponent } from './staff-files.component';

describe('StaffFilesComponent', () => {
  let component: StaffFilesComponent;
  let fixture: ComponentFixture<StaffFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
