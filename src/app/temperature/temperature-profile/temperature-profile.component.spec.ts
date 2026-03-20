import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemperatureProfileComponent } from './temperature-profile.component';

describe('TemperatureProfileComponent', () => {
  let component: TemperatureProfileComponent;
  let fixture: ComponentFixture<TemperatureProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemperatureProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemperatureProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
