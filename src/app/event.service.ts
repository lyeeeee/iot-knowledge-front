import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {Observable} from "rxjs";
import {JsonResponse} from "./routes/knowledge/directory";
import {
  KnowledgeComplexEvent,
  KnowledgeComplexSubEvent, KnowledgeComplexTarget,
  KnowledgeMetaEvent,
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
    return this.http.get<JsonResponse>('api/complexevent/getAll',{'name': name});
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
}
