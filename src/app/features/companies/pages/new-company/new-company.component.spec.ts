import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCompanyComponent } from './new-company.component';

describe('NewCompanyComponent', () => {
  let component: NewCompanyComponent;
  let fixture: ComponentFixture<NewCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
