import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisinsectComponent } from './disinsect.component';

describe('DisinsectComponent', () => {
  let component: DisinsectComponent;
  let fixture: ComponentFixture<DisinsectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisinsectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisinsectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
