import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventMetaEventListComponent } from './meta-event-list/meta-event-list.component';
import { EventComplexEventListComponent } from './complex-event-list/complex-event-list.component';

const routes: Routes = [

  { path: 'meta-event-list', component: EventMetaEventListComponent },
  { path: 'complex-event-list', component: EventComplexEventListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }
