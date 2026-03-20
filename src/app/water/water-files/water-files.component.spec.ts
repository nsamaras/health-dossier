import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterFilesComponent } from './water-files.component';

describe('WaterFilesComponent', () => {
  let component: WaterFilesComponent;
  let fixture: ComponentFixture<WaterFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
