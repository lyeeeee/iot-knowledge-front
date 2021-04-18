import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {Observable} from "rxjs";
import {JsonResponse} from "./routes/knowledge/directory";
import {
  KnowledgeComplexEvent,
  KnowledgeComplexSubEvent, KnowledgeComplexTarget, KnowledgeFomula,
  KnowledgeMetaEvent, KnowledgeSelectFormula,
  MetaEventAttrRelation
} from "./routes/event/event";
import {DirectoryService} from "./directory.service";

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: _HttpClient,
              private directoryService: DirectoryService) { }


  public addMetaEvent(metaEvent: KnowledgeMetaEvent) : Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/metaevent/add', JSON.stringify(metaEvent),null,{
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getKnowledgeAttribute(metaEventId: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/knowledge/getKnowledgeProperty', {'metaEventId': metaEventId},);
  }

  public getKnowledgeAttributeByUri(knowledgeUri: string): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/knowledge/getKnowledgePropertyByUri', {'knowledgeUri': knowledgeUri},);
  }


  public addMetaEventAttrRelation(metaEventAttrRelation: MetaEventAttrRelation) : Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/metaevent/addRelation', JSON.stringify(metaEventAttrRelation),null,{
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getAllRelation(metaEventId: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/metaevent/getAllRelation',{'metaEventId': metaEventId});
  }

  public deleteRelation(relationId: number): Observable<JsonResponse> {
    return this.http.delete<JsonResponse>('api/metaevent/deleteRelation',{'relationId': relationId});
  }

  public deleteMetaEvent(metaEventId: number): Observable<JsonResponse> {
    return this.http.delete<JsonResponse>('api/metaevent/delete',{'metaEventId': metaEventId});
  }

  public addComplexEvent(complexEvent: KnowledgeComplexEvent): Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/complexevent/add',JSON.stringify(complexEvent), null,{
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getAllComplexEvent(name: string): Observable<JsonResponse> {
    let param = new Object();
    if (name != null) {
      param['name'] = name;
    }
    return this.http.get<JsonResponse>('api/complexevent/getAll',param);
  }

  public getAllMetaEvent(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/metaevent/getAll');
  }

  public getMeteEventAttrById(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/metaevent/getAllRelation',{'metaEventId': id});
  }

  public addComplexSubEvent(subEvent: KnowledgeComplexSubEvent): Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/complexevent/addSubEvent',JSON.stringify(subEvent), null,{
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getAllSubEvent(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getAllSubEvent',{'complexEventId': id});
  }

  public deleteComplexEvent(id: number): Observable<JsonResponse>{
    return this.http.delete<JsonResponse>('api/complexevent/delete',{'complexEventId': id});
  }

  public deleteComplexSubEvent(id: number): Observable<JsonResponse>{
    return this.http.delete<JsonResponse>('api/complexevent/deleteSubEvent',{'complexSubEventId': id});
  }

  public addMetaEventRelation(left, right, lr, complexId): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/addMetaEventRelation',{'left':left, 'right':right, 'lr':lr,'complexId':complexId});
  }

  public addComplexTarget(target: KnowledgeComplexTarget): Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/complexevent/addTarget',JSON.stringify(target), null,{
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getAllTarget(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getAllTarget',{'complexEventId': id});
  }

  public addTargetRelation(left, right, lr, complexId): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/addTargetRelation',{'left':left, 'right':right, 'lr':lr,'complexId':complexId});
  }

  public getAllSubEventRelation(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getAllSubEventRelation',{'complexEventId': id});
  }

  public getAllTargetRelation(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getAllTargetRelation',{'complexEventId': id});
  }

  public deleteComplexTarget(id: number): Observable<JsonResponse>{
    return this.http.delete<JsonResponse>('api/complexevent/deleteTarget',{'complexTargetId': id});
  }

  public deleteSubEventRelation(id: number): Observable<JsonResponse>{
    return this.http.delete<JsonResponse>('api/complexevent/deleteSubEventRelation',{'complexEventId': id});
  }

  public deleteTargetRelation(id: number): Observable<JsonResponse>{
    return this.http.delete<JsonResponse>('api/complexevent/deleteTargetRelation',{'complexEventId': id});
  }

  public deduce(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/deduce',{'complexEventId': id});
  }

  public stopDeduce(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/stopDeduce',{'complexEventId': id});
  }

  public getSelectedKnowledge(id: number): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getKnowledgeByComplexId',{'complexEventId': id});
  }

  public getKnowledgeBySparsql(sql: string):Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/knowledge/getKnowledgeBySparql',{'sql': sql});
  }

  public saveKnowledgeForEvent(id: number, ids:number[]):Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/saveKnowledgeForEvent',{'complexEventId': id, 'selectedIds':ids});
  }

  public getAllKnowledge():Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/knowledge/getAllKnowledgeKnowledge');
  }

  public addFolumaKnowledge(foluma:KnowledgeFomula):Observable<JsonResponse> {
    console.log(foluma)
    return this.http.post<JsonResponse>('api/complexevent/addFolumaKnowledge', JSON.stringify(foluma), null, {
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public saveKnowledgeByRange(complexId: number, field:string, department:string, metaDir:string, s:string, p:string, o:string ):Observable<JsonResponse> {
    let body = new Object();
    if (field != null) body['field'] = field;
    if (department != null) body['department'] = department;
    if (metaDir != null) body['metaDir'] = metaDir;
    if (s != null) body['s'] = s;
    if (p != null) body['p'] = p;
    if (o != null) body['o'] = o;
    body['complexId'] = complexId;
    return this.http.post<JsonResponse>('api/complexevent/saveKnowledgeByRange',
      JSON.stringify(body), null, {
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getFomulaByType(type:number):Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getFomulaByType', {'type':type});
  }

  public getFomulaByComplexId(id:number):Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getFomulaByComplexId', {'complexId':id});
  }

  public addSelectFormula(complexId: number, foluma:KnowledgeSelectFormula):Observable<JsonResponse> {
    return this.http.post<JsonResponse>('api/complexevent/addSelectedFoluma', JSON.stringify(foluma), null, {
      headers: this.directoryService.headers,
      observe: 'response',
    });
  }

  public getAllAlarm(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/complexevent/getAllAlarm');
  }
}
