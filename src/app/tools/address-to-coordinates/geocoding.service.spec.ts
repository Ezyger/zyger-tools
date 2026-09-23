import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the Nominatim search endpoint with the given query', () => {
    service.search('Rua Rio Nilo, 200, Manaus, Brazil').subscribe();

    const req = httpMock.expectOne(
      (request) => request.url === 'https://nominatim.openstreetmap.org/search' && request.params.get('q') === 'Rua Rio Nilo, 200, Manaus, Brazil',
    );
    expect(req.request.params.get('format')).toBe('json');
    expect(req.request.params.get('limit')).toBe('1');
    req.flush([{ lat: '-3.10342', lon: '-60.01268' }]);
  });
});
