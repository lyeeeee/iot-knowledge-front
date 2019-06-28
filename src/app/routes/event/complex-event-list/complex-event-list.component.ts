import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc';
import { SFSchema } from '@delon/form';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-event-complex-event-list',
  templateUrl: './complex-event-list.component.html',
})
export class EventComplexEventListComponent implements OnInit {
  url = `/user`;
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  @ViewChild('st') st: STComponent;
  columns: STColumn[] = [
    { title: '编号', index: 'no' },
    { title: '调用次数', type: 'number', index: 'callNo' },
    { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    { title: '时间', type: 'date', index: 'updatedAt' },
    {
      title: '',
      buttons: [
        // { text: '查看', click: (item: any) => `/metaEventForm/${item.id}` },
        // {text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  constructor(private notification: NzNotificationService,private http: _HttpClient, private modal: ModalHelper) { }

  ngOnInit() { }

  aaa() {


  }
  createNotification(type: string): void {
    this.notification.create(
      //error，warning,info
      type,
      '报警',
      '这是一个报警，这是一个报警，这是一个报警，这是一个报警，这是一个报警，这是一个报警'
    );
  }

}
