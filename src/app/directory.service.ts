import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {HttpClient} from "@angular/common/http";
import {DirectoryDTO, JsonResponse} from "./routes/knowledge/directory";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {

  constructor(private http: _HttpClient,
              private https: HttpClient,) { }

  /**
   * 获取所有的领域部门和元目录信息
   * */
  getAllDirecotory(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/directory/getAllDirectory', {'owner': 'knowledge_class'})
  }
}
