import { formatClock } from './format';

describe('formatClock', () => {
  it('renders mm:ss below one hour', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(59)).toBe('00:59');
    expect(formatClock(60)).toBe('01:00');
    expect(formatClock(599)).toBe('09:59');
  });

  it('renders h:mm:ss above one hour', () => {
    expect(formatClock(3600)).toBe('1:00:00');
    expect(formatClock(3661)).toBe('1:01:01');
  });

  it('clamps negatives to zero', () => {
    expect(formatClock(-5)).toBe('00:00');
  });
});
