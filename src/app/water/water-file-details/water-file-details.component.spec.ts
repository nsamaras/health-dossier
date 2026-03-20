import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterFileDetailsComponent } from './water-file-details.component';

describe('WaterFileDetailsComponent', () => {
  let component: WaterFileDetailsComponent;
  let fixture: ComponentFixture<WaterFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
