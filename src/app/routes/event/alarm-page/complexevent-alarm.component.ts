import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe, Time} from "@angular/common";
import {EventService} from "../../../event.service";
import {NzNotificationService} from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd/message';
import {DirectoryService} from "../../../directory.service";
import {STColumn} from "@delon/abc";

@Component({
  selector: 'app-event-complexevent-alarm',
  templateUrl: './complexevent-alarm.component.html',
})
export class EventComplexeventAlarmComponent implements OnInit {



  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: '系统', index: 'sys'},
    {title: '复杂事件', index: 'complexEvent'},
    {title: '复杂事件说明', index: 'complexEventSynopsis'},
    {title: '站点', index: 'site'},
    {title: '时间', index: 'time'}
  ];

  list: any[] = [];

  constructor(private notification: NzNotificationService,
              private fb: FormBuilder,
              private modal: ModalHelper,
              private http: _HttpClient,
              private datePipe: DatePipe,
              private eventService: EventService,
              private msg: NzMessageService,
              private directoryService: DirectoryService) {
  }

  ngOnInit() {

    this.getAlarmList();
  }

  getAlarmList() {
    this.eventService.getAllAlarm().subscribe(data => {
      let ret = data.data;
      this.list = Array(ret.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            system: ret[idx].sys,
            complexEvent: ret[idx].complexEvent,
            complexEventSynopsis: ret[idx].complexEventSynopsis,
            site: ret[idx].site,
            time: new Date(ret[idx].time)
          }
        }).sort(((a, b) => {
          return b.time.getTime() - a.time.getTime()
        }))
    });
  }
}
