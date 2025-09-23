import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-profile-modal.component.html'
})
export class AdminProfileModalComponent {
  @Input() visible = false;
  @Input() profile: any;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
