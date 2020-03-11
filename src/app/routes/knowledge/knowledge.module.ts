import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { KnowledgeRoutingModule } from './knowledge-routing.module';
import { KnowledgeListComponent } from './list/list.component';
import { KnowledgeFieldListComponent } from './field-list/field-list.component';
import { KnowledgeDepartmentListComponent } from './department-list/department-list.component';
import { KnowledgeMetaCatalogueListComponent } from './meta-catalogue-list/meta-catalogue-list.component';
import { KnowledgeKnowledgeManageComponent } from './knowledge-manage/knowledge-manage.component';
import { KnowledgeKnowledgedirManageComponent } from './knowledgedir-manage/knowledgedir-manage.component';

const COMPONENTS = [
  KnowledgeListComponent,
  KnowledgeFieldListComponent,
  KnowledgeDepartmentListComponent,
  KnowledgeMetaCatalogueListComponent,
  KnowledgeKnowledgeManageComponent,
  KnowledgeKnowledgedirManageComponent,];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    KnowledgeRoutingModule,
    NzIconModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class KnowledgeModule { }
