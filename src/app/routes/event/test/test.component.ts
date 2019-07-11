import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc';
import { SFSchema } from '@delon/form';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-event-test',
  templateUrl: './test.component.html',
})
export class EventTestComponent implements OnInit {
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
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  constructor(private http: _HttpClient, private modal: ModalHelper,private notification: NzNotificationService,) { }

  ngOnInit() { }

  add() {
    this.notification.create(
      //error，warning,info三种状态
      'error',
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td></tr><tr><td>1111111</td><td>222222222222</td><td>3333</td><td>444444</td></tr></table>',//在这里写表格内容
      {
        nzStyle: {width:'470px',marginLeft: '-100px',color:'red'},//弹出框的样式，分别是宽度，左距离，颜色
        nzDuration: 0,//显示时间，单位是毫秒，0为一直显示，不自动关闭
      }
    );
  }

}
