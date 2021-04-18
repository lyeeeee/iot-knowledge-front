import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventMetaEventListComponent } from './meta-event-list/meta-event-list.component';
import { EventComplexEventListComponent } from './complex-event-list/complex-event-list.component';
import { EventTestComponent } from './test/test.component';
import { EventMetaeventManageComponent } from './metaevent-manage/metaevent-manage.component';
import { EventComplexeventManageComponent } from './complexevent-manage/complexevent-manage.component';
import {EventComplexeventAlarmComponent} from "./alarm-page/complexevent-alarm.component";

const routes: Routes = [

  { path: 'meta-event-list', component: EventMetaEventListComponent },
  { path: 'complex-event-list', component: EventComplexEventListComponent },
  { path: 'test', component: EventTestComponent },
  { path: 'metaevent-manage', component: EventMetaeventManageComponent },
  { path: 'complexevent-manage', component: EventComplexeventManageComponent },
  { path: 'complexevent-alarm', component: EventComplexeventAlarmComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventRoutingModule { }
