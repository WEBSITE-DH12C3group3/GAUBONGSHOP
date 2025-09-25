import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressBookService, UserAddress } from '../services/address-book.service';

@Component({
  selector: 'app-address-book-select',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="space-y-2">
    <div class="text-sm text-gray-600">Sổ địa chỉ</div>
    <div class="flex flex-wrap gap-2">
      <button *ngFor="let a of list()" type="button" class="px-3 py-1 rounded-xl border"
              (click)="choose(a)">
        {{ a.label || a.addressLine }}
      </button>
    </div>
  </div>
  `
})
export class AddressBookSelectComponent {
  @Output() chooseAddress = new EventEmitter<UserAddress>();
  list = signal<UserAddress[]>([]);
  constructor(private svc: AddressBookService) { this.refresh(); }
  refresh() { this.svc.list().subscribe(res => this.list.set(res)); }
  choose(a: UserAddress) { this.chooseAddress.emit(a); }
}