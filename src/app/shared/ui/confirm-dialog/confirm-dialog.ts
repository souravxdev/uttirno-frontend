import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { LanguageStore } from '../../../core/i18n/i18n-state/language.store';
import { AppButton } from '../button/button';

let dialogSeq = 0;

/**
 * Confirmation dialog on the native <dialog> element — focus trap, Esc
 * and backdrop dismiss come for free. Callers hold a template ref and
 * call open(): `<app-confirm-dialog #dlg …/>` … `dlg.open()`.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [AppButton],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfirmDialog {
  protected readonly i18n = inject(LanguageStore);

  readonly title = input.required<string>();
  readonly message = input('');
  readonly confirmLabel = input.required<string>();
  readonly danger = input(true);
  readonly confirmed = output<void>();

  protected readonly titleId = `confirm-dialog-title-${dialogSeq++}`;

  private readonly dlg =
    viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  open(): void {
    this.dlg().nativeElement.showModal();
  }

  close(): void {
    this.dlg().nativeElement.close();
  }

  protected confirm(): void {
    this.close();
    this.confirmed.emit();
  }
}
