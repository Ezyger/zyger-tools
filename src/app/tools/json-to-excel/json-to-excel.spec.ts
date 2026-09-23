import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonToExcel } from './json-to-excel';

describe('JsonToExcel', () => {
  let component: JsonToExcel;
  let fixture: ComponentFixture<JsonToExcel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonToExcel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonToExcel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
