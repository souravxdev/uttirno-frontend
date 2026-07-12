import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../../core/api/api-base';
import { HistoryStore } from './history.store';

const HISTORY_URL = `${API_BASE_URL}/api/sessions?page=1&pageSize=10`;

describe('HistoryStore', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sets loadError when the request fails and clears loading', () => {
    const store = TestBed.inject(HistoryStore);
    store.load();
    httpMock
      .expectOne(HISTORY_URL)
      .flush('nope', { status: 500, statusText: 'Server Error' });

    expect(store.loadError()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('clears loadError on a successful retry', () => {
    const store = TestBed.inject(HistoryStore);

    store.load();
    httpMock
      .expectOne(HISTORY_URL)
      .flush('nope', { status: 500, statusText: 'Server Error' });
    expect(store.loadError()).toBe(true);

    store.load();
    httpMock.expectOne(HISTORY_URL).flush({ items: [], total: 0 });

    expect(store.loadError()).toBe(false);
    expect(store.loading()).toBe(false);
  });
});
