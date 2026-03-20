import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffFileDetailsComponent } from './staff-file-details.component';

describe('StaffFileDetailsComponent', () => {
  let component: StaffFileDetailsComponent;
  let fixture: ComponentFixture<StaffFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
