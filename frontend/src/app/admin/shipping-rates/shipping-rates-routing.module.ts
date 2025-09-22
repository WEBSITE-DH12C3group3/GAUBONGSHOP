// src/app/admin/shipping-rates/shipping-rates-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ShippingCarrierListComponent } from './shipping-carrier-list';
import { ShippingCarrierFormComponent } from './shipping-carrier-form';
import { ShippingServiceListComponent } from './shipping-service-list';
import { ShippingServiceFormComponent } from './shipping-service-form';      // đảm bảo đã tạo
import { CarrierRateRuleListComponent } from './carrier-rate-rule-list';
import { CarrierRateRuleFormComponent } from './carrier-rate-rule-form';    // nếu có

const routes: Routes = [
  {
    path: '',
    data: { permission: 'manage_shippingrate' },
    children: [
      { path: '', component: ShippingCarrierListComponent },

      { path: 'carriers/new', component: ShippingCarrierFormComponent },
      { path: 'carriers/:id', component: ShippingCarrierFormComponent },

      // 🔽 Đặt 'new' TRƯỚC param-route để không bị nuốt
      { path: 'services/new', component: ShippingServiceFormComponent },
      { path: 'services/edit/:id', component: ShippingServiceFormComponent },

      // 🔽 List tách riêng by-carrier để không đụng với edit
      { path: 'services/by-carrier/:carrierId', component: ShippingServiceListComponent },

      // Rule
      { path: 'rules/new', component: CarrierRateRuleFormComponent },
      { path: 'rules/edit/:id', component: CarrierRateRuleFormComponent },   // <— EDIT
      { path: 'rules/by-service/:serviceId', component: CarrierRateRuleListComponent }, // <-- LIST
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShippingRatesRoutingModule {}
