import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Add  } from './add/add.component';
import { InventoryDashboard } from './inventory-dashboard/inventory-dashboard.component';

export const routes: Routes  = [
  { path: 'add', component: Add},
  { path:  'dashboard', component: InventoryDashboard}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule] 
})

export class ClothesRoutingModule {}
