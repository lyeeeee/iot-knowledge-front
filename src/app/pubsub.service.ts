import { Injectable } from '@angular/core';
import {_HttpClient} from "@delon/theme";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class PubsubService {

  constructor(private http: _HttpClient) { }

  public getAllTopic() : Observable<any> {
    return this.http.get<any>('http://192.168.1.101/topic/list',{});
  }

  public getTopicAttribute(topicName: string): Observable<Map<string, string>> {
    return this.http.get<Map<string, string>>('http://192.168.1.101/topic/schemaInfo',{'topicname':topicName});
  }
}
