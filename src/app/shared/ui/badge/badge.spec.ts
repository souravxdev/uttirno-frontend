import { difficultyTone, sourceTypeTone, statusTone } from './badge';

describe('badge tone mappers', () => {
  it('maps question status to semantic tones', () => {
    expect(statusTone('DRAFT')).toBe('slate');
    expect(statusTone('IN_REVIEW')).toBe('amber');
    expect(statusTone('PUBLISHED')).toBe('emerald');
  });

  it('maps difficulty to semantic tones', () => {
    expect(difficultyTone('EASY')).toBe('emerald');
    expect(difficultyTone('MEDIUM')).toBe('amber');
    expect(difficultyTone('HARD')).toBe('rose');
  });

  it('maps source type to semantic tones — AI is always violet', () => {
    expect(sourceTypeTone('AI_GENERATED')).toBe('violet');
    expect(sourceTypeTone('PAST_PAPER')).toBe('sky');
    expect(sourceTypeTone('ORIGINAL')).toBe('slate');
  });
});
