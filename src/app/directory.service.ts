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
  getAllDirecotory(): Observable<JsonResponse> {
    return this.http.get<JsonResponse>('api/directory/getAllDirectory', {'owner': ['knowledge_class','knowledge']},);
  }

  /**
   * 创建结点
   * */
  createNode(node: DirectoryNode): Observable<any> {
    return this.http.post<any>('api/directory/add', JSON.stringify(node),null,{
      headers: this.headers,
      observe: 'response',
  });
  }
  /**
   * 删除当前节点
   * */
  dropNode(nodeActived: NzTreeNode): Observable<any> {
    let nodeId: string = nodeActived.key;
    return this.http.delete('api/directory/delete',{'nodeId': nodeId, 'cascade':true});
  }
}
