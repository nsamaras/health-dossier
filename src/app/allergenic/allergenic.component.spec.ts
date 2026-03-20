import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllergenicComponent } from './allergenic.component';

describe('AllergenicComponent', () => {
  let component: AllergenicComponent;
  let fixture: ComponentFixture<AllergenicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllergenicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllergenicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
