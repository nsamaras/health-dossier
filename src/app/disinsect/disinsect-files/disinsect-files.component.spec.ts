import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisinsectFilesComponent } from './disinsect-files.component';

describe('DisinsectFilesComponent', () => {
  let component: DisinsectFilesComponent;
  let fixture: ComponentFixture<DisinsectFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisinsectFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisinsectFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
