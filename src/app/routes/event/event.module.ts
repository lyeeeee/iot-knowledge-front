import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { EventRoutingModule } from './event-routing.module';
import { EventMetaEventListComponent } from './meta-event-list/meta-event-list.component';
import { EventComplexEventListComponent } from './complex-event-list/complex-event-list.component';

const COMPONENTS = [
  EventMetaEventListComponent,
  EventComplexEventListComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    EventRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class EventModule { }
