import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningFilesComponent } from './cleaning-files.component';

describe('CleaningFilesComponent', () => {
  let component: CleaningFilesComponent;
  let fixture: ComponentFixture<CleaningFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CleaningFilesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CleaningFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
