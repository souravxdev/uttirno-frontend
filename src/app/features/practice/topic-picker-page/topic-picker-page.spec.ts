import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../../core/api/api-base';
import { TopicPickerPage } from './topic-picker-page';

const TREE = [
  {
    id: 'e1',
    slug: 'bcs-preliminary',
    name: 'বিসিএস',
    subjects: [
      { id: 's1', slug: 'bangla', name: 'বাংলা', order: 1, topics: [] },
      { id: 's2', slug: 'english', name: 'English', order: 2, topics: [] },
    ],
  },
];

describe('TopicPickerPage', () => {
  let httpMock: HttpTestingController;

  function create(): ComponentRef<TopicPickerPage> {
    const ref = TestBed.createComponent(TopicPickerPage).componentRef;
    // Taxonomy loads once on construction.
    httpMock.expectOne(`${API_BASE_URL}/api/taxonomy/tree`).flush(TREE);
    return ref;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists every subject when no filter is set', () => {
    const ref = create();
    ref.setInput('subject', undefined);
    ref.changeDetectorRef.detectChanges();
    const instance = ref.instance as unknown as {
      subjects: () => unknown[];
      filtered: () => boolean;
    };
    expect(instance.subjects()).toHaveLength(2);
    expect(instance.filtered()).toBe(false);
  });

  it('narrows to a single subject when ?subject= matches', () => {
    const ref = create();
    ref.setInput('subject', 'english');
    ref.changeDetectorRef.detectChanges();
    const instance = ref.instance as unknown as {
      subjects: () => { slug: string }[];
      filtered: () => boolean;
    };
    expect(instance.subjects()).toHaveLength(1);
    expect(instance.subjects()[0].slug).toBe('english');
    expect(instance.filtered()).toBe(true);
  });

  it('falls back to all subjects when the slug is unknown', () => {
    const ref = create();
    ref.setInput('subject', 'nope');
    ref.changeDetectorRef.detectChanges();
    const instance = ref.instance as unknown as {
      subjects: () => unknown[];
      filtered: () => boolean;
    };
    expect(instance.subjects()).toHaveLength(2);
    expect(instance.filtered()).toBe(false);
  });
});
