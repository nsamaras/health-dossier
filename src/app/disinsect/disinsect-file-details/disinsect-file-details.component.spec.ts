import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisinsectFileDetailsComponent } from './disinsect-file-details.component';

describe('DisinsectFileDetailsComponent', () => {
  let component: DisinsectFileDetailsComponent;
  let fixture: ComponentFixture<DisinsectFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisinsectFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisinsectFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
