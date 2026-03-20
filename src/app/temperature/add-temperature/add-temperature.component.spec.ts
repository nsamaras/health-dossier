import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTemperatureComponent } from './add-temperature.component';

describe('AddTemperatureComponent', () => {
  let component: AddTemperatureComponent;
  let fixture: ComponentFixture<AddTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTemperatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
