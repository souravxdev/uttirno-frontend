import { TestBed } from '@angular/core/testing';
import { ToastStore } from './toast.store';

describe('ToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  afterEach(() => vi.useRealTimers());

  it('shows and auto-dismisses toasts', () => {
    const store = TestBed.inject(ToastStore);
    store.success('saved');
    store.error('broke');
    expect(store.toasts()).toHaveLength(2);
    expect(store.toasts()[0]).toMatchObject({
      kind: 'success',
      message: 'saved',
    });
    vi.advanceTimersByTime(3500);
    expect(store.toasts()).toHaveLength(0);
  });

  it('dismisses a single toast by id', () => {
    const store = TestBed.inject(ToastStore);
    store.info('one');
    store.info('two');
    store.dismiss(store.toasts()[0].id);
    expect(store.toasts()).toHaveLength(1);
    expect(store.toasts()[0].message).toBe('two');
  });
});
