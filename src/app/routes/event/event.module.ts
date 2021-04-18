import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { EventRoutingModule } from './event-routing.module';
import { EventMetaEventListComponent } from './meta-event-list/meta-event-list.component';
import { EventComplexEventListComponent } from './complex-event-list/complex-event-list.component';
import { EventTestComponent } from './test/test.component';
import { EventMetaeventManageComponent } from './metaevent-manage/metaevent-manage.component';
import { EventComplexeventManageComponent } from './complexevent-manage/complexevent-manage.component';
import {EventComplexeventAlarmComponent} from "./alarm-page/complexevent-alarm.component";

const COMPONENTS = [
  EventMetaEventListComponent,
  EventComplexEventListComponent,
  EventTestComponent,
  EventMetaeventManageComponent,
  EventComplexeventManageComponent,
  EventComplexeventAlarmComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    EventRoutingModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class EventModule { }
