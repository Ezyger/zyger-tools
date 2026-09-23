import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressToCoordinates } from './address-to-coordinates';

describe('AddressToCoordinates', () => {
  let component: AddressToCoordinates;
  let fixture: ComponentFixture<AddressToCoordinates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressToCoordinates],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressToCoordinates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
