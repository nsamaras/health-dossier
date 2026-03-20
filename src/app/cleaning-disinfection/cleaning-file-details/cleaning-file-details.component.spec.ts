import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleaningFileDetailsComponent } from './cleaning-file-details.component';

describe('CleaningFileDetailsComponent', () => {
  let component: CleaningFileDetailsComponent;
  let fixture: ComponentFixture<CleaningFileDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CleaningFileDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CleaningFileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
