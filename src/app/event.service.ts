import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {Observable} from "rxjs";
import {JsonResponse} from "./routes/knowledge/directory";
import {KnowledgeMetaEvent, MetaEventAttrRelation} from "./routes/event/event";
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
}
