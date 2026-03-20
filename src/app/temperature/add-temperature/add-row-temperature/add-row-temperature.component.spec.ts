import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRowTemperatureComponent } from './add-row-temperature.component';

describe('AddRowTemperatureComponent', () => {
  let component: AddRowTemperatureComponent;
  let fixture: ComponentFixture<AddRowTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRowTemperatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRowTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
