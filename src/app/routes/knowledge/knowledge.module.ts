import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { KnowledgeRoutingModule } from './knowledge-routing.module';
import { KnowledgeListComponent } from './list/list.component';
import { KnowledgeFieldListComponent } from './field-list/field-list.component';
import { KnowledgeDepartmentListComponent } from './department-list/department-list.component';
import { KnowledgeMetaCatalogueListComponent } from './meta-catalogue-list/meta-catalogue-list.component';

const COMPONENTS = [
  KnowledgeListComponent,
  KnowledgeFieldListComponent,
  KnowledgeDepartmentListComponent,
  KnowledgeMetaCatalogueListComponent];
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
