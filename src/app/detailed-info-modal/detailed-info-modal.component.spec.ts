import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedInfoModalComponent } from './detailed-info-modal.component';

describe('DetailedInfoModalComponent', () => {
  let component: DetailedInfoModalComponent;
  let fixture: ComponentFixture<DetailedInfoModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailedInfoModalComponent]
    });
    fixture = TestBed.createComponent(DetailedInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
