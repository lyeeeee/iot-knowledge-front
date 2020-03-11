import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KnowledgeListComponent } from './list/list.component';
import { KnowledgeFieldListComponent } from './field-list/field-list.component';
import { KnowledgeDepartmentListComponent } from './department-list/department-list.component';
import { KnowledgeMetaCatalogueListComponent } from './meta-catalogue-list/meta-catalogue-list.component';
import { KnowledgeKnowledgeManageComponent } from './knowledge-manage/knowledge-manage.component';
import { KnowledgeKnowledgedirManageComponent } from './knowledgedir-manage/knowledgedir-manage.component';

const routes: Routes = [

  { path: 'list', component: KnowledgeListComponent },
  { path: 'fieldList', component: KnowledgeFieldListComponent },
  { path: 'departmentList', component: KnowledgeDepartmentListComponent },
  { path: 'metaCatalogueList', component: KnowledgeMetaCatalogueListComponent },
  { path: 'knowledge-manage', component: KnowledgeKnowledgeManageComponent },
  { path: 'knowledgedir-manage', component: KnowledgeKnowledgedirManageComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeRoutingModule { }
