import {Component, OnInit, ViewChild} from '@angular/core';
import {_HttpClient, ModalHelper} from '@delon/theme';
import {STColumn, STComponent} from '@delon/abc';
import {SFSchema} from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-event-meta-event-list',
  templateUrl: './meta-event-list.component.html',
})
export class EventMetaEventListComponent implements OnInit {
  list: any[] = [];
  relationList: any[] = [];//对应关系List
  insertMetaEventIsVisible;//是否显示新增原子事件弹出框
  deleteMetaEventIsVisible;//是否显示删除原子事件弹出框
  relationIsVisible;//是否显示对应关系弹出框
  addRelationIsVisible;//是否显示新增对应关系弹出框
  deleteRelationIsVisible;//是否显示删除对应关系弹出框
  name = '';//原子事件名称
  metaEventName: any[] = [];//存放所有已存在的原子事件名称，更新及新增时检查是否已存在
  metaEventUpdateId = '';//修改原子事件id
  metaEventDeleteId = '';//删除原子事件id
  relationDeleteId = '';//删除对应关系id
  relationId = '';//设置对应关系的原子事件的id
  selectList: any[] = [];//存放所有级联查询数据
  selectValues: any[] | null = null;

  iotList: any[] = [];//知识List
  systemList: any[] = [];//系统List
  subsitesList: any[] = [];//子站List
  subsystemList: any[] = [];//子系统List
  equipmentList: any[] = [];//设备List
  attributeList: any[] = [];//属性List
  checkedIot = '';//当前选中的知识
  checkedIot_system = '';//当前选中的系统
  checkedSubsites = '';//当前选中的子站
  checkedSubsystem = '';//当前选中的子系统
  checkedEquipment = '';//当前选中的设备
  checkedAttribute = '';//当前选中的属性

  metaEventForm: FormGroup;
  relationForm: FormGroup;

  searchSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '原子事件名称'
      }
    }
  };
  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '原子事件名称', index: 'name'},
    {title: '原子事件简介', index: 'synopsis'},
    {title: '创建时间', index: 'insertTime'},
    {
      title: '操作',
      buttons: [
        {text: '查看与编辑对应关系', click: (item: any) => this.addOrUpdateRelation(item)},
        // {text: '修改', click: (item: any) => this.updateMetaEvent(item)},
        {text: '删除', click: (item: any) => this.deleteMetaEvent(item)},
      ]
    }
  ];
  @ViewChild('relationst', { static: true }) relationst: STComponent;
  relationColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '系统', index: 'iotSystem'},
    {title: '子站', index: 'subsites'},
    {title: '子系统', index: 'subsystem'},
    {title: '设备', index: 'equipment'},
    {title: '属性', index: 'attribute'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteRelation(item)},
      ]
    }
  ];

  constructor(private http: _HttpClient,
              private modal: ModalHelper,
              private fb: FormBuilder,
              private notification: NzNotificationService,) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getList();
    this.metaEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
    });
    this.relationForm = this.fb.group({
      selectIot: [null, [Validators.required]],
      selectSystem: [null, [Validators.required]],
      selectSubsites: [null, [Validators.required]],
      selectSubsystem: [null, [Validators.required]],
      selectEquipment: [null, [Validators.required]],
      selectAttribute: [null, [Validators.required]],
      // selectField: [null, [Validators.required]],
    });
  }

  //调用后台接口获取list数据
  getList() {
    this.metaEventName = [];
    this.http.get('api/metaEvent/infoList', {
      name: this.name
    }).subscribe(data => {
      this.list = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          this.metaEventName.push(data[idx].name);
          return {
            name: data[idx].name,
            synopsis: data[idx].synopsis,
            insertTime: data[idx].insertTime,
            id: data[idx].id,
          }
        })
    })
  }

  //搜索按钮
  queryList(event) {
    this.name = event.name;
    this.getList();
  }

  //删除原子事件
  deleteMetaEvent(item) {
    this.deleteMetaEventIsVisible = true;
    this.metaEventDeleteId = item.id;
  }

  //确认删除后提交
  deleteMetaEventSubmit() {
    this.deleteMetaEventIsVisible = false;
    this.http.delete('api/metaEvent/infoList/deleteMetaEvent/' + this.metaEventDeleteId).subscribe(data => {
      this.getList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.metaEventDeleteId = '';//删除成功后置空
    })
  }

  //新增原子事件取消按钮
  handleCancel(): void {
    this.insertMetaEventIsVisible = false;
    this.deleteMetaEventIsVisible = false;
    this.metaEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
    });
  }

  //新增原子事件弹出框
  addMetaEvent(item) {
    this.insertMetaEventIsVisible = true;
  }

  //原子事件新增或修改  提交到后台
  submitMetaEvent() {
    //检查是否存在
    if (!this.checkMetaEventName(this.metaEventForm.value.name)) {
      this.notification.create("error",
        '提示', this.metaEventForm.value.name + '已存在！'
      );
      return;
    }
    //不存在则新增或修改
    this.http.post('api/metaEvent/infoList/insertMetaEvent', {
      name: this.metaEventForm.value.name,
      synopsis: this.metaEventForm.value.synopsis,
      id: this.metaEventUpdateId,
    }).subscribe(data => {
      this.insertMetaEventIsVisible = false;
      this.getList();
      this.metaEventUpdateId = '';
    })
  }

  //遍历检查原子事件name中是否存在
  checkMetaEventName(name) {
    for (const metaEventName of this.metaEventName) {
      if (name === metaEventName) {
        return false;
      }
    }
    return true;
  }

  //修改弹出框（使用新增的弹出框，把值赋上即可）
  updateMetaEvent(item) {
    this.insertMetaEventIsVisible = true;
    this.metaEventForm = this.fb.group({
      name: [item.name, [Validators.required]],
      synopsis: [item.synopsis, [Validators.required]],
    });
    this.metaEventUpdateId = item.id;
  }

  //打开对应关系弹出框
  addOrUpdateRelation(item) {
    this.relationIsVisible = true;
    this.relationId = item.id;
    this.getRelationList();//获取对应关系列表
    this.getIotList();//获取知识列表
  }

  //获取对应关系列表
  getRelationList() {
    this.http.get('api/metaEvent/infoList/getRelationList', {
      relationId: this.relationId
    }).subscribe(data => {
      console.log(data);
      this.relationList = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            equipment: data[idx].equipment,
            attribute: data[idx].attribute,
            iotSystem: data[idx].iotSystem,
            subsites: data[idx].subsites,
            subsystem: data[idx].subsystem,
            id: data[idx].id,
          }
        })
    })
  }

  getIotList() {
    this.http.get('api/metaEvent/infoList/getIotList', {}).subscribe(data => {
      this.iotList = data;
      console.log(this.iotList);
    })
  }

  //对应关系的取消按钮方法
  relationHandleCancel(): void {
    this.relationIsVisible = false;
    this.relationId = '';
  }

  //新增对应关系
  addRelation() {
    this.addRelationIsVisible = true;
    //获取所有级联查询数据
    // this.http.get('api/metaEvent/infoList/getSelect', {}).subscribe(data => {
    //   this.selectList = data;
    // })
  }

  //新增对应关系的取消按钮方法
  addRelationHandleCancel(): void {
    this.addRelationIsVisible = false;
    this.relationForm = this.fb.group({
      selectIot: [null, [Validators.required]],
      selectSystem: [null, [Validators.required]],
      selectSubsites: [null, [Validators.required]],
      selectSubsystem: [null, [Validators.required]],
      selectEquipment: [null, [Validators.required]],
      selectAttribute: [null, [Validators.required]],
      // selectField: [null, [Validators.required]],
    });
    this.cleanChecked();
  }

  cleanChecked() {
    this.checkedIot = '';//当前选中的知识
    this.checkedIot_system = '';//当前选中的系统
    this.checkedSubsites = '';//当前选中的子站
    this.checkedSubsystem = '';//当前选中的子系统
    this.checkedEquipment = '';//当前选中的设备
    this.checkedAttribute = '';//当前选中的属性
    this.systemList = [];//系统List
    this.subsitesList = [];//子站List
    this.subsystemList = [];//子系统List
    this.equipmentList = [];//设备List
    this.attributeList = [];//属性List
  }

  //提交保存对应关系
  submitRelation() {
    this.http.post('api/metaEvent/infoList/addRelation', {
      graphName: this.checkedIot,
      iotSystem: this.checkedIot_system,
      subsites: this.checkedSubsites,
      subsystem: this.checkedSubsystem,
      equipment: this.checkedEquipment,
      attribute: this.checkedAttribute,
      metaEventId: this.relationId,
    }).subscribe(data => {
      this.addRelationHandleCancel();
      this.getRelationList();
    })
  }

  //删除对应关系
  deleteRelation(item) {
    this.deleteRelationIsVisible = true;
    this.relationDeleteId = item.id;
  }

  //删除对应关系取消按钮方法
  deleteRelationHandleCancel(): void {
    this.deleteRelationIsVisible = false;
  }

//删除对应关系提交
  deleteRelationSubmit() {
    this.deleteRelationIsVisible = false;
    this.http.delete('api/metaEvent/infoList/deleteRelation/' + this.relationDeleteId).subscribe(data => {
      this.getRelationList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.relationDeleteId = '';//删除成功后置空
    })
  }

  //当选择的知识改变时，去后台拉取对应的系统
  iotChange(e) {
    this.cleanChecked();
    this.checkedIot = e;
    this.http.get('api/metaEvent/infoList/getSystemList', {
      graph_name: this.checkedIot
    }).subscribe(data => {
      this.systemList = data;
    })
  }

//当选择的系统改变时，去后台拉取对应的子站
  systemChange(e) {
    this.checkedIot_system = e;
    this.http.get('api/metaEvent/infoList/getSubsitesList', {
      iot_system: this.checkedIot_system
    }).subscribe(data => {
      this.subsitesList = data;
    })
  }

  //当选择的子站改变时，去后台拉取对应的子系统
  subsitesChange(e) {
    this.checkedSubsites = e;
    this.http.get('api/metaEvent/infoList/getSubsystemList', {
      subsites: this.checkedSubsites
    }).subscribe(data => {
      this.subsystemList = data;
    })
  }

  //当选择的子系统改变时，去后台拉取对应的设备
  subsystemChange(e) {
    this.checkedSubsystem = e;
    this.http.get('api/metaEvent/infoList/getEquipmentList', {
      subsystem: this.checkedSubsystem
    }).subscribe(data => {
      this.equipmentList = data;
    })
  }

  //当选择的设备改变时，去后台拉取对应的属性
  equipmentChange(e) {
    this.checkedEquipment = e;
    this.http.get('api/metaEvent/infoList/getAttributeList', {
      equipment: this.checkedEquipment
    }).subscribe(data => {
      this.attributeList = data;
    })
  }

  attributeChange(e) {
    this.checkedAttribute = e;
  }


}
