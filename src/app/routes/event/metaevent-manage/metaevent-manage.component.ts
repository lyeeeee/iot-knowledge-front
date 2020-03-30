import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc/table';
import { SFSchema } from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzCascaderOption, NzNotificationService} from "ng-zorro-antd";
import {DirectoryService} from "../../../directory.service";
import {DirectoryDTO} from "../../knowledge/directory";
import {EventService} from "../../../event.service";
import {KnowledgeMetaEvent, MetaEventAttrRelation} from "../event";
import {PubsubService} from "../../../pubsub.service";

@Component({
  selector: 'app-event-metaevent-manage',
  templateUrl: './metaevent-manage.component.html',
})
export class EventMetaeventManageComponent implements OnInit {
  list: any[] = [];
  insertMetaEventIsVisible;//是否显示新增原子事件弹出框
  deleteMetaEventIsVisible;//是否显示删除原子事件弹出框
  relationIsVisible;//是否显示对应关系弹出框
  /**
   * 是否显示新增对应关系弹出框
   * */
  addRelationIsVisible;

  deleteRelationIsVisible;//是否显示删除对应关系弹出框
  name = '';//原子事件名称
  metaEventName: any[] = [];//存放所有已存在的原子事件名称，更新及新增时检查是否已存在
  metaEventUpdateId = '';//修改原子事件id
  metaEventDeleteId: number = null;//删除原子事件id
  relationDeleteId: number = null;//删除对应关系id
  metaEventId: number = null;//设置对应关系的原子事件的id
  selectList: any[] = [];//存放所有级联查询数据
  selectValues: any[] | null = null;

  topicList: any[] = ['1','1'];//知识List
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
  /**
   * 知识的属性列表
   * */
  knowledgeAttributeMap: Map<string, string> = null;

  /**
   * 事件的属性列表
   * */
  topicAttributeMap: Map<string, string> = null;

  knowledgeAttributeList: any[] = [];
  topicAttributeList: any[] = [];

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

  /**
   * 显示原子事件的，动态json schema
   * */
  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '原子事件名称', index: 'name'},
    {title: '原子事件简介', index: 'synopsis'},
    {title: '知识名称', index: 'knowledge'},
    {title: '主题', index: 'topic'},
    {
      title: '操作',
      buttons: [
        {text: '查看与编辑对应关系', click: (item: any) => this.addOrUpdateRelation(item)},
        // {text: '修改', click: (item: any) => this.updateMetaEvent(item)},
        {text: '删除', click: (item: any) => this.deleteMetaEvent(item)},
      ]
    }
  ];

  /**
   * 属性绑定关系list
   * */
  relationList: any[] = [];

  @ViewChild('relationst', { static: true }) relationst: STComponent;
  relationColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '知识属性', index: 'knowledgeAttribute'},
    {title: '知识属性数据类型', index: 'knowledgeAttributeType'},
    {title: '主题属性', index: 'topicAttribute'},
    {title: '主题属性数据类型', index: 'topicAttributeType'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteRelation(item)},
      ]
    }
  ];

  /**
   * 表单级联选择
   * */
  options = [];
  nzOptions: NzCascaderOption[] = this.options;

  allDirectoryInfo: DirectoryDTO;

  constructor(private http: _HttpClient,
              private modal: ModalHelper,
              private fb: FormBuilder,
              private notification: NzNotificationService,
              private directoryService: DirectoryService,
              private eventService: EventService,
              private pubsubService: PubsubService) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getMetaEventList();
    this.metaEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
      selectIot: [null, [Validators.required]],
      selectTopic: [null, [Validators.required]],
    });
    // this.relationForm = this.fb.group({
    //   selectIot: [null, [Validators.required]],
    //   selectSystem: [null, [Validators.required]],
    //   selectSubsites: [null, [Validators.required]],
    //   selectSubsystem: [null, [Validators.required]],
    //   selectEquipment: [null, [Validators.required]],
    //   selectAttribute: [null, [Validators.required]],
    // });
    this.relationForm = this.fb.group({
      selectKnowledgeAttr: [null, [Validators.required]],
      selectTopicAttr: [null, [Validators.required]],
    });
    this.getAllDirectory();
  }

  /**
   * 获取原子事件列表
   * */
  private getMetaEventList(): void{
    this.metaEventName = [];
    this.http.get('api/metaevent/getAll', {
      name: this.name
    }).subscribe(data => {
      data = data.data;
      this.list = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          this.metaEventName.push(data[idx].name);
          return {
            name: data[idx].name,
            synopsis: data[idx].synopsis,
            knowledge: data[idx].knowledge,
            topic: data[idx].topic,
            id: data[idx].id,
          }
        })
    })
  }

  /**
   * 搜索按钮
   * */
  queryList(event) {
    this.name = event.name;
    this.getMetaEventList();
  }

  /**
   * 删除原子事件
   * */
  private deleteMetaEvent(item): void{
    this.deleteMetaEventIsVisible = true;
    this.metaEventDeleteId = item.id;
  }

  /**
   * 确认删除后提交
   * */
  private deleteMetaEventSubmit(): void {
    this.deleteMetaEventIsVisible = false;
    this.eventService.deleteMetaEvent(this.metaEventDeleteId).subscribe(data => {
      this.getMetaEventList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.metaEventDeleteId = null;//删除成功后置空
    });
  }

  /**
   * 处理新增原子事件取消事件
   * */
  private handleCancel(): void {
    this.insertMetaEventIsVisible = false;
    this.deleteMetaEventIsVisible = false;
    this.metaEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
      selectIot: [null, [Validators.required]],
      selectTopic: [null, [Validators.required]],
    });
  }

  /**
   * 弹出新增原子事件表单
   * */
  private addMetaEvent(item): void {
    this.insertMetaEventIsVisible = true;
    this.getTopicList();
  }

  /**
   * 原子事件新增或修改,提交到后台
   * */
  private submitMetaEvent(): void {
    let metaEvent: KnowledgeMetaEvent = new KnowledgeMetaEvent();
    metaEvent.name = this.metaEventForm.value.name;
    metaEvent.synopsis = this.metaEventForm.value.synopsis;
    metaEvent.topic = this.metaEventForm.value.selectTopic;
    metaEvent.knowledgeId = this.metaEventForm.value.selectIot[this.metaEventForm.value.selectIot.length-1];
    console.log(metaEvent);
    this.eventService.addMetaEvent(metaEvent).subscribe(data => {
       let msg = data['body'].msg;
       if (msg != 'success') {
         this.notification.create("error",
           '提示', msg
         );
       } else {
         this.insertMetaEventIsVisible = false;
         this.getMetaEventList();
         this.metaEventUpdateId = '';
       }

    });
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

  /**
   * 打开新增对应关系弹出框
   * */
  private addOrUpdateRelation(item): void {
    this.relationIsVisible = true;
    this.metaEventId = item.id;
    this.getRelationList();//获取对应关系列表
    this.getTopicList();//获取知识列表
    this.getKnowledgeAttributeList(this.metaEventId);
    this.getTopicAttributeList(item.topic);
  }

  /**
   * 增加属性映射时，获取知识的属性
   * */
  private getKnowledgeAttributeList(metaEventId: number): void {
    this.eventService.getKnowledgeAttribute(metaEventId).subscribe(data => {
      this.knowledgeAttributeList = data.data;
    });
  }

  /**
   * 增加属性映射时，获取主题的属性
   * */
  private getTopicAttributeList(topic: string): void {
    this.pubsubService.getTopicAttribute(topic).subscribe(data => {
      this.topicAttributeMap = data;
      this.topicAttributeList = [];
      for (let i in this.topicAttributeMap) {
        this.topicAttributeList.push(i);
      }
      this.relationst.reload();
    });
  }

  /**
   * 获取原子事件的属性绑定关系列表
   * */
  private getRelationList(): void {
    this.eventService.getAllRelation(this.metaEventId).subscribe(data => {
      let list:MetaEventAttrRelation[] = data['data'];
      this.relationList = Array(list.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            topicAttribute: list[idx].topicAttribute,
            topicAttributeType: list[idx].topicAttributeType,
            knowledgeAttribute: list[idx].knowledgeAttribute,
            knowledgeAttributeType: list[idx].knowledgeAttributeType,
            id: list[idx].id,
          }
        })
    });
  }

  /**
   * 获取发布订阅所有主题列表
   * */
  private getTopicList():void {
    this.pubsubService.getAllTopic().subscribe(data => {
      this.topicList = data;
    });
  }

  /**
   * 原子事件属性绑定界面取消按钮方法
   * */
  private relationHandleCancel(): void {
    this.relationIsVisible = false;
    this.metaEventId = null;
  }

  /**
   * 弹出新增对应关系窗口
   * */
  private addRelation(): void {
    this.addRelationIsVisible = true;
    //获取所有级联查询数据
    // this.http.get('api/metaEvent/infoList/getSelect', {}).subscribe(data => {
    //   this.selectList = data;
    // });
  }

  /**
   * 处理新增对应关系的取消按钮方法
   * */
  private addRelationHandleCancel(): void {
    this.addRelationIsVisible = false;
    this.relationForm = this.fb.group({
      selectKnowledgeAttr: [null, [Validators.required]],
      selectTopicAttr: [null, [Validators.required]],
    });
    this.cleanChecked();
  }

  private cleanChecked(): void {
    this.checkedIot = '';//当前选中的知识
    this.checkedIot_system = '';//当前选中的系统
    this.checkedSubsites = '';//当前选中的子站
    this.checkedSubsystem = '';//当前选中的子系统
    this.checkedEquipment = '';//当前选中的设备
    this.checkedAttribute = '';//当前选中的属性
    this.equipmentList = [];//设备List
    this.attributeList = [];//属性List
  }

  /**
   * 提交保存对应关系
   * */
  private submitRelation(): void {
    let metaEventAttrRelation:MetaEventAttrRelation = new MetaEventAttrRelation();
    metaEventAttrRelation.knowledgeAttribute = this.relationForm.value.selectKnowledgeAttr;
    metaEventAttrRelation.topicAttribute = this.relationForm.value.selectTopicAttr;
    metaEventAttrRelation.topicAttributeType = this.topicAttributeMap[metaEventAttrRelation.topicAttribute];
    metaEventAttrRelation.metaEventId = this.metaEventId;
    this.eventService.addMetaEventAttrRelation(metaEventAttrRelation).subscribe(data => {
      this.addRelationHandleCancel();
      this.getRelationList();
    });
  }

  /**
   * 删除对应关系
   * */
  private deleteRelation(item): void {
    this.deleteRelationIsVisible = true;
    this.relationDeleteId = item.id;
  }

  /**
   * 删除对应关系取消按钮方法
   * */
  private deleteRelationHandleCancel(): void {
    this.deleteRelationIsVisible = false;
  }

  /**
   * 删除对应关系提交
   * */
  private deleteRelationSubmit():void {
    this.deleteRelationIsVisible = false;
    this.eventService.deleteRelation(this.relationDeleteId).subscribe(data => {
      this.getRelationList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.relationDeleteId = null;//删除成功后置空
    });
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

  private onChanges(e) :void {

  }

  private getAllDirectory() :void {
      this.directoryService.getAllDirecotory()
      .subscribe(data => {
      this.allDirectoryInfo = data['data'];
      this.options = [];
      this.handleOptions(this.allDirectoryInfo.child, this.options);
      this.nzOptions = this.options;
    });
  }

  private handleOptions(dir: DirectoryDTO[], op:NzCascaderOption[]) : void{
    if (dir == null || dir.length == 0){
      return;
    }
    else {
      for (let i = 0;i < dir.length; ++i) {
        if (dir[i].child == null || dir[i].child.length == 0) {
          op.push({ value: dir[i].cur.id,label: dir[i].cur.value, isLeaf: true});
        } else {
          op.push({value: dir[i].cur.id, label: dir[i].cur.value, children:[]});
          this.handleOptions(dir[i].child, op[i].children);
        }
      }
    }
  }
}
