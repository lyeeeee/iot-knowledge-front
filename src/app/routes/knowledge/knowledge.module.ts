import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { KnowledgeRoutingModule } from './knowledge-routing.module';
import { KnowledgeListComponent } from './list/list.component';

const COMPONENTS = [
  KnowledgeListComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    KnowledgeRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class KnowledgeModule { }
