import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningDisinfectionComponent } from './cleaning-disinfection.component';

describe('CleaningDisinfectionComponent', () => {
  let component: CleaningDisinfectionComponent;
  let fixture: ComponentFixture<CleaningDisinfectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CleaningDisinfectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CleaningDisinfectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
