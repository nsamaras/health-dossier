import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTemperatureComponent } from './edit-temperature.component';

describe('EditTemperatureComponent', () => {
  let component: EditTemperatureComponent;
  let fixture: ComponentFixture<EditTemperatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditTemperatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTemperatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
