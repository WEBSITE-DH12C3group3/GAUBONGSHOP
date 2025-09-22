import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ShippingRatesRoutingModule } from './shipping-rates-routing.module';

import { ShippingCarrierListComponent } from './shipping-carrier-list';
import { ShippingCarrierFormComponent } from './shipping-carrier-form';
import { ShippingServiceListComponent } from './shipping-service-list';
import { CarrierRateRuleListComponent } from './carrier-rate-rule-list';
import { ShippingServiceFormComponent } from './shipping-service-form';
import { CarrierRateRuleFormComponent } from './carrier-rate-rule-form';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    ShippingRatesRoutingModule,
    ShippingCarrierListComponent,
    ShippingCarrierFormComponent,
    ShippingServiceListComponent,
    ShippingServiceFormComponent,  
    CarrierRateRuleListComponent,
    CarrierRateRuleFormComponent
  ]
})
export class ShippingRatesModule {}
