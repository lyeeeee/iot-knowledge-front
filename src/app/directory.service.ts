import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {DirectoryNode, JsonResponse} from "./routes/knowledge/directory";
import {Observable} from "rxjs";
import {NzTreeNode} from "ng-zorro-antd";

@Injectable({
  providedIn: 'root'
})
export class DirectoryService {
  public headers = new HttpHeaders().set("Content-Type", "application/json");
  constructor(private http: _HttpClient,) { }

  /**
   * 获取所有的领域部门和元目录信息
   * */
  public getAllDirecotory(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/directory/getAllDirectory', {'owner': ['knowledge_class','knowledge']},);
  }

  /**
   * 创建结点
   * */
  public createNode(node: DirectoryNode): Observable<any> {
    return this.http.post<any>('api/directory/add', JSON.stringify(node),null,{
      headers: this.headers,
      observe: 'response',
  });
  }
  /**
   * 删除当前节点
   * */
  public dropNode(nodeActived: NzTreeNode): Observable<any> {
    let nodeId: string = nodeActived.key;
    return this.http.delete('api/directory/delete',{'nodeId': nodeId, 'cascade':true});
  }

  public getAllKnowledge(knowledgeName: string, field: number, department: number, metaDir: number): Observable<JsonResponse> {
    let param = new Object();
    if (knowledgeName != null) {
      param['knowledgeName'] = knowledgeName;
    }
    if (field != null) {
      param['field'] = field;
    }
    if (department != null) {
      param['department'] = department;
    }
    if (metaDir != null) {
      param['metaDir'] = metaDir;
    }
    return this.http.get<JsonResponse>('api/knowledge/getAllKnowledge',
      param,);
  }

  public getAllModel(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/knowledge/getAllModel');
  }

  public deleteModel(id: any): Observable<JsonResponse>  {
    return this.http.delete<JsonResponse>('api/knowledge/deleteModel',{'fileId': id});
  }
}
