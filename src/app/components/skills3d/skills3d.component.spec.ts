import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skills3dComponent } from './skills3d.component';

describe('Skills3dComponent', () => {
  let component: Skills3dComponent;
  let fixture: ComponentFixture<Skills3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Skills3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Skills3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
