import { Component, EventEmitter, Input, Output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeoService, SuggestItem } from '../services/geo.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-address-suggest-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="relative">
    <input type="text"
       class="w-full rounded-xl border px-3 py-2"
       [placeholder]="placeholder"
       [(ngModel)]="value"
       (focus)="focused = true"
       (blur)="onBlur()"
       (ngModelChange)="onChange($event)"/>
    <ul *ngIf="list().length>0 && focused" class="absolute z-10 mt-1 w-full bg-white border rounded-xl shadow">
      <li *ngFor="let it of list()" class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          (click)="pick(it)">{{ it.label }}</li>
    </ul>
  </div>
  `
})
export class AddressSuggestInputComponent {
  @Input() province?: string;
  @Input() district?: string;
  @Input() placeholder = 'Nhập địa chỉ...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() pickItem = new EventEmitter<SuggestItem>();

  focused = false;
  private query$ = new Subject<string>();
  list = signal<SuggestItem[]>([]);

  constructor(private geo: GeoService) {
    this.query$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(q => this.geo.suggest(q, this.province, this.district))
    ).subscribe(res => this.list.set(res));
  }

  onChange(v: string) { this.valueChange.emit(v); this.query$.next(v); }
  pick(it: SuggestItem) {
    this.value = it.fullAddress || it.label;
    this.valueChange.emit(this.value);
    this.pickItem.emit(it);
    this.list.set([]); this.focused = false;
  }
  
  onBlur() { setTimeout(() => { this.focused = false; this.list.set([]); }, 150); }

}