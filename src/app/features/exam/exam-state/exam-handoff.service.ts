import { Injectable } from '@angular/core';

/**
 * In-memory handoff flag between the config page (which starts an exam) and
 * the player. Because it lives in memory, it survives the SPA navigation but
 * is cleared on a full page reload — exactly how the player distinguishes a
 * fresh start from a resume-after-disconnect.
 */
@Injectable({ providedIn: 'root' })
export class ExamHandoffService {
  private justStartedId: string | null = null;

  markStarted(sessionId: string): void {
    this.justStartedId = sessionId;
  }

  /** Returns the freshly-started id (if any) and clears it. */
  consume(): string | null {
    const id = this.justStartedId;
    this.justStartedId = null;
    return id;
  }
}
