import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[appHasPermission]' })
export class HasPermissionDirective {
  private need: string | string[] = [];

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  @Input() set appHasPermission(val: string | string[]) {
    this.need = val;
    this.render();
  }

  private render() {
    const perms = this.auth.permissions();
    const ok = Array.isArray(this.need)
      ? this.need.every(p => perms.includes(p))
      : perms.includes(this.need);
    this.vcr.clear();
    if (ok) this.vcr.createEmbeddedView(this.tpl);
  }
}
