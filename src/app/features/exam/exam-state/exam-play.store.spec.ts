import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../../../core/api/api-base';
import type { Dto } from '../../../core/api/api.types';
import { ExamPlayStore } from './exam-play.store';

const BASE = `${API_BASE_URL}/api/sessions`;

function playState(
  overrides: Partial<Dto<'SessionPlayStateDto'>> = {},
): Dto<'SessionPlayStateDto'> {
  return {
    id: 's1',
    status: 'IN_PROGRESS',
    questionCount: 2,
    timeLimitSec: 300,
    startedAt: '2026-07-12T12:00:00.000Z',
    expiresAt: '2026-07-12T12:05:00.000Z',
    remainingSec: 300,
    questions: [
      {
        order: 0,
        questionId: 'q0',
        stem: 'প্রশ্ন ১',
        options: ['ক', 'খ', 'গ', 'ঘ'],
        language: 'BN',
        selectedIndex: null,
      },
      {
        order: 1,
        questionId: 'q1',
        stem: 'প্রশ্ন ২',
        options: ['ক', 'খ', 'গ', 'ঘ'],
        language: 'BN',
        selectedIndex: 1,
      },
    ],
    ...overrides,
  };
}

describe('ExamPlayStore', () => {
  let httpMock: HttpTestingController;
  let store: InstanceType<typeof ExamPlayStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-12T12:00:00.000Z'));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ExamPlayStore,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(ExamPlayStore);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  function loadSession(remainingSec: number): void {
    store.load('s1');
    httpMock
      .expectOne(`${BASE}/s1/play`)
      .flush(playState({ remainingSec }));
  }

  it('sets the deadline from the server remainingSec and ticks it down', () => {
    loadSession(300);
    expect(store.remainingSec()).toBe(300);
    expect(store.total()).toBe(2);
    expect(store.answeredCount()).toBe(1);

    vi.advanceTimersByTime(10_000);
    expect(store.remainingSec()).toBe(290);
  });

  it('resyncs the deadline from every save ack', () => {
    loadSession(300);
    store.select(2);
    // Optimistic selection is applied before the server answers.
    expect(store.current()!.selectedIndex).toBe(2);

    const req = httpMock.expectOne(`${BASE}/s1/answers`);
    expect(req.request.body).toEqual({ questionId: 'q0', selectedIndex: 2 });
    // Server says less time is left than the local clock believed.
    req.flush({ questionId: 'q0', selectedIndex: 2, remainingSec: 120 });
    expect(store.remainingSec()).toBe(120);
  });

  it('auto-submits exactly once when the deadline passes', () => {
    loadSession(2);
    vi.advanceTimersByTime(2_500);
    httpMock.expectOne(`${BASE}/s1/submit`).flush({ id: 's1' });
    expect(store.finished()).toBe(true);

    // Further ticks must not fire a second submit (verify() would throw).
    vi.advanceTimersByTime(5_000);
    httpMock.expectNone(`${BASE}/s1/submit`);
  });

  it('treats a 409 on save as session over', () => {
    loadSession(300);
    store.select(0);
    httpMock
      .expectOne(`${BASE}/s1/answers`)
      .flush(null, { status: 409, statusText: 'Conflict' });
    expect(store.finished()).toBe(true);
  });

  it('starts a CREATED session on load (resume from history)', () => {
    store.load('s1');
    httpMock
      .expectOne(`${BASE}/s1/play`)
      .flush(playState({ status: 'CREATED', remainingSec: null }));
    httpMock.expectOne(`${BASE}/s1/start`).flush(playState({ remainingSec: 300 }));
    expect(store.remainingSec()).toBe(300);
    expect(store.status()).toBe('IN_PROGRESS');
  });

  it('goes straight to finished when the session is already over', () => {
    store.load('s1');
    httpMock
      .expectOne(`${BASE}/s1/play`)
      .flush(playState({ status: 'SUBMITTED' }));
    expect(store.finished()).toBe(true);
  });
});
