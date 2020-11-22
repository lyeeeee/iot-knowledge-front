import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc/table';
import {
  FormProperty,
  SFComponent, SFRadioWidgetSchema,
  SFSchema,
  SFSchemaEnum, SFSelectWidgetSchema, SFStringWidgetSchema,
  SFTextareaWidgetSchema,
  SFTransferWidgetSchema
} from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {
  KnowledgeComplexEvent,
  KnowledgeComplexSubEvent, KnowledgeComplexSubEventRelation,
  KnowledgeComplexTarget, KnowledgeComplexTargetRelation, KnowledgeFomula,
  KnowledgeMetaEvent,
  MetaEventAttrRelation
} from "../event";
import {EventService} from "../../../event.service";
import {NzNotificationService} from "ng-zorro-antd";
import {NzTransferModule} from "ng-zorro-antd/transfer";
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {DirectoryService} from "../../../directory.service";
import {KnowledgeDetail, KnowledgeKnowledge} from "../../knowledge/knowledge";

@Component({
  selector: 'app-event-complexevent-manage',
  templateUrl: './complexevent-manage.component.html',
})
export class EventComplexeventManageComponent implements OnInit {

  list: any[] = [];
  metaList: any[] = [];//所选知识列表
  attributeList: any[] = [];//对应关系列表
  targetList: any[] = [];//目标列表
  insertComplexEventIsVisible;//是否显示新增复杂事件弹出框
  deleteComplexEventIsVisible;//是否显示删除复杂事件弹出框
  addMetaIsVisible;//是否显示选择元知识弹出框
  saveMetaIsVisible = false;//是否显示新增选择元知识弹出框
  deleteMetaIsVisible;//是否显示删除选择元知识弹出框
  addAttributeIsVisible;//是否显示添加属性弹出框
  saveAttributeIsVisible;//是否显示新增添加属性弹出框
  deleteAttributeIsVisible;//是否显示删除添加属性弹出框
  addTargetIsVisible;//是否显示添加目标弹出框
  saveTargetIsVisible;//是否显示新增目标弹出框
  deleteTargetIsVisible;//是否显示删目标弹出框
  /**
   * 复杂事件名称
   * */
  name = null;
  /**
   * 存放所有已存在的复杂事件名称，更新及新增时检查是否已存在
   * */
  complexEventName: any[] = [];
  /**
   * 存放所有的复杂事件 map
   * */
  complexEvents: Map<number, KnowledgeComplexEvent> = new Map<number, KnowledgeComplexEvent>();

  complexEventUpdateId = null;//修改复杂事件id
  /**
   * 保存删除复杂事件id
   * */
  complexEventDeleteId = null;
  complexId: number = null;
  allMetaList: any[] = [];//存放所有原子事件
  checkMeta = '';//所选原子事件
  checkRelation = '';//所选属性关系
  /**
   * 要删除的子事件的id
   * */
  deleteMetaId = null;
  deleteAttributeId = '';//要删除的属性关系的id
  /**
   * 要删除的目标的id
   * */
  deleteTargetId = null;
  attributeRelationInfo = '';//属性关系展示信息
  metaEventCompany = '';//原子事件范围单位展示信息
  relationList: any[] = [{value: 0, label: "小于"}, {value: 1, label: "小于等于"}, {value: 2, label: "等于"},
    {value: 3, label: "大于等于"}, {value: 4, label: "大于"},{value:5 ,label:"between"},
    {value:6, label:"不等于"},{value:7, label:"in"}];
  /**
   * 存放子事件列表
   * */
  metaEventList: KnowledgeMetaEvent[] = [];
  /**
   * 存放选择原子事件id同，名称的对应关系
   * */
  metaEventMap: Map<number,string> = new Map<number, string>();
  /**
   * 子事件关系列表
   * */
  subEventRelationList: KnowledgeComplexSubEventRelation[] = [];
  /**
   * 子事件关系map
   * */
  subEventRelationMap: Map<number, KnowledgeComplexSubEventRelation> = new Map<number, KnowledgeComplexSubEventRelation>();
  /**
   * 子事件关系表单所用
   * */
  lrelationList: any[] = [{value: "1", label: "与"}, {value: "2", label: "或"}];

  /**
   * 当前子事件逻辑关系
   * */
  fullLogicRelation: string = null;
  /**
   * 当前目标逻辑关系
   * */
  fullTargetLogicRelation: string = null;
  /**
   * 目标关系列表
   * */
  targetRelationList: KnowledgeComplexTargetRelation[] = [];
  /**
   * 目标关系map
   * */
  targetRelationMap: Map<number, KnowledgeComplexTargetRelation> = new Map<number, KnowledgeComplexTargetRelation>();

  checkRange = "";

  metaAttributeList: MetaEventAttrRelation[] = [];

  checktype = "";
  typrInfo = "";
  andOrNot = "";//与或非
  targetName = "";
  warnType = 1;
  stopTimer = false;
  time1 = "";
  typeSum = 0;

  /**
   * 是否展示编辑原子事件逻辑关系
   * */
  insertMetaEventLogicRelationIsVisible: boolean = false;
  /**
   * 是否展示编辑目标逻辑关系
   * */
  insertTargetLogicRelationIsVisible: boolean = false;

  /**
   * 是否展示选择知识
   * */
  sparqlSelectKnowledgeIsVisible: boolean = false;

  /**
   * 编辑原子事件逻辑关系表单
   * */
  metaEventLogicRelationForm:FormGroup;
  /**
   * 编辑目标逻辑关系表单
   * */
  targetLogicRelationForm:FormGroup;
  complexEventForm: FormGroup;
  metaForm: FormGroup;
  attributeForm: FormGroup;
  targetForm: FormGroup;


  searchSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '复杂事件名称'
      }
    }
  };

  /**
   * sparql选择增加知识的动态表单
   * */
  @ViewChild('sfSparalSelectedKnowledge', { static: true }) sfSparalSelectedKnowledge: SFComponent;
  sparqlSelectedKnowledgeSchema: SFSchema = {
    properties: {
      remark1: {
        type: 'string',
        title: 'SPARQL',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 5, maxRows: 20 },
        } as SFTextareaWidgetSchema,
        default:'model1|SELECT ?s\n' +
          'WHERE {\n' +
          '    ?s ?p ?o.\n' +
          '}',
      },
      remark2: {
        type: 'string',
        title: 'KNOWLEDGE',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 10, maxRows: 20 },
        } as SFTextareaWidgetSchema,
      },
    },
  };

  /**
   * 选择增加知识的动态表单
   * */
  @ViewChild('sfSelectedKnowledge', { static: true }) sfSelectedKnowledge: SFComponent;
  selectedKnowledgeSchema: SFSchema = {
    properties: {
      field: {
        type: 'string',
        title: '领域',
      },
      department: {
        type: 'string',
        title: '部门',
      },
      metaDir: {
        type: 'string',
        title: '元目录',
      },
      s: {
        type: 'string',
        title: '主语',
      },
      p: {
        type: 'string',
        title: '谓词',
      },
      o: {
        type: 'string',
        title: '宾语',
      },
    },
  };

  /**
   * 插入公式的动态表单
   * */
  @ViewChild('sfinsertFormula', { static: true }) sfinsertFormula: SFComponent;
  insertFormulaSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '公式名',
      },
      btn1: {
        type: 'string',
        title: '是否全局',
        enum: [{label :'是', value:1}, {label:'否', value:0}],
        ui: {
          widget: 'radio',
        } as SFRadioWidgetSchema,
        default: 1,
      },
      btn2: {
        type: 'string',
        title: '是否完整定义',
        enum: ['是', '否'],
        ui: {
          widget: 'radio',
        } as SFRadioWidgetSchema,
        default: '是',
      },
      globalFormula: {
        type: 'string',
        title: '公式文本',
        default: '',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 10, maxRows: 20 },
        } as SFTextareaWidgetSchema,
      },
      relation: {
        type: 'string',
        title: '关联变量',
        default: '',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 10, maxRows: 20 },
        } as SFTextareaWidgetSchema,
      },
      knowledge: {
        type: 'string',
        title: '选取知识',
        enum: [
          { label: '待支付', value: 'WAIT_BUYER_PAY', otherData: 1 },
        ],
        ui: {
          widget: 'select',
        } as SFSelectWidgetSchema,
      },
    },
  };


  /**
   * 复杂事件展示框
   * */
  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '复杂事件名称', index: 'name'},
    {title: '复杂事件简介', index: 'synopsis'},
    {title: '子事件逻辑关系', index: 'logicRelation'},
    {title: '目标逻辑关系', index: 'targetRelation'},
    {
      title: '操作',
      buttons: [
        {text: '选择原子事件', click: (item: any) => this.addOrUpdateMeta(item)},
        // {text: '编辑属性', click: (item: any) => this.addOrUpdateAttribute(item)},
        {text: '编辑目标', click: (item: any) => this.addOrUpdateTarget(item)},
        {text: '添加未完成公式', click: (item: any) => this.addUncompletedFormula(item)},
        {text: '添加已完成公式', click: (item: any) => this.addCompletedFormula(item)},
        {text: '修改', click: (item: any) => this.updateComplexEvent(item)},
        {text: '删除', click: (item: any) => this.deleteComplexEvent(item)},
        {text: '监控推理', click: (item: any) => this.deduce(item)},
        {text: '停止', click: (item: any) => this.stopDeduce(item)},
        {text: '原子事件关系', click: (item: any) => this.addLogicRelation(item)},
        {text: '目标关系', click: (item: any) => this.addTargetRelation(item)},
        {text: '选择知识', click: (item: any) => this.selectKnowledge(item)},
        {text: 'SPARQL选择', click: (item: any) => this.sparqlSelectKnowledge(item)},
        {text: '插入公式知识', click: (item: any) => this.insertFormula(item)},
      ]
    }
  ];
  /**
   * 新增原子事件范围，schema
   * */
  @ViewChild('metast', { static: true }) metast: STComponent;
  metaColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => true},
    {title: '原子事件范围单位', index: 'subeventRange'},
    {title: '原子事件名称', index: 'subeventName'},
    {title: '属性', index: 'metaAttribute'},
    {title: '关系', index: 'attributeRelation'},
    {title: '值', index: 'relationValue'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteMeta(item)},
        {text: '修改', click: (item: any) => this.editMeta(item)},
      ]
    }
  ];
  @ViewChild('attributest', { static: true }) attributest: STComponent;
  attributeColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    // {title: '类型', index: 'type'},
    {title: '名称', index: 'attributeName'},
    {title: '关系', index: 'attributeRelation'},
    {title: '值', index: 'attributeValue'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteAttribute(item)},
      ]
    }
  ];
  @ViewChild('targetst', { static: true }) targetst: STComponent;
  targetColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => true},
    // {title: '类型', index: 'type'},
    {title: '原子事件名称', index: 'subeventName'},
    {title: '属性', index: 'metaAttribute'},
    {title: '关系', index: 'targetRelation'},
    {title: '值', index: 'relationValue'},
    {title: '时间窗口', index: 'timeWindow'},
    {title: '长度窗口', index: 'lenWindow'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteTarget(item)},
        {text: '修改', click: (item: any) => this.editTarget(item)},
      ]
    }
  ];

  /**
   * 用于保存修改子事件的id
   * */
  editSubEventId : number = null;

  /**
   * 用于保存修改目标的id
   * */
  editTargetId : number = null;

  /**
   * 是否已经开启查询推理结果的定时器
   * */
  timerStarted : boolean = false;

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
    //进入页面获取列表数据
    this.getList();
    this.getAllMetaEvent();
    this.complexEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
    });
    this.metaForm = this.fb.group({
      metaEventRange:[null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      metaAttribute: [null, [Validators.required]],
      metaEventRelation: [null, [Validators.required]],
      metaEventValue: [null, [Validators.required]],
    });
    this.attributeForm = this.fb.group({
      // selectType: [null, [Validators.required]],
      attributeName: [null, [Validators.required]],
      attributeRelation: [null, [Validators.required]],
      attributeValue: [null, [Validators.required]],
    });
    this.targetForm = this.fb.group({
      //selectAndOrNot: [null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      //targetName: [null, [Validators.required]],
      metaAttribute: [null, [Validators.required]],
      targetRelation: [null, [Validators.required]],
      targetValue: [null, [Validators.required]],
      timeWindow:[null],
      lenWindow:[null],
    });
    this.metaEventLogicRelationForm = this.fb.group({
      formulaA: [null, [Validators.required]],
      formulaB: [null, [Validators.required]],
      lrelation: [null, [Validators.required]],
    });
    this.targetLogicRelationForm = this.fb.group({
      formulaA: [null, [Validators.required]],
      formulaB: [null, [Validators.required]],
      lrelation: [null, [Validators.required]],
    });
    //this.warn();

  }

  /**
   * 获取所有的原子事件
   * */
  private getAllMetaEvent(): void {
    this.eventService.getAllMetaEvent().subscribe(data => {
        this.metaEventList = data.data;
        this.metaEventMap.clear();
        this.metaEventList.forEach(e => {
          this.metaEventMap.set(e.id, e.name);
        })
    });
  }
  /**
   * 调用后台接口获取复杂事件list数据
   * */
  private getList(): void {
    this.complexEventName = [];
    this.eventService.getAllComplexEvent(this.name).subscribe(data => {
      let events = data.data;
      this.complexEventName = [];
      this.complexEvents.clear();
      this.list = Array(events.length)
        .fill({}).map((item: any, idx: number) => {
          this.complexEventName.push(events[idx].name);
          this.complexEvents.set(events[idx].id, events[idx]);
          return {
            name: events[idx].name,
            synopsis: events[idx].synopsis,
            logicRelation: events[idx].relation,
            id: events[idx].id,
            targetRelation: events[idx].targetRelation,
          }
        })
      this.name = null;
    });
  }

  //搜索按钮
  queryList(event) {
    this.name = event.name;
    this.getList();
  }

  /**
   * 删除复杂事件
   * */
  private deleteComplexEvent(item):void {
    this.deleteComplexEventIsVisible = true;
    this.complexEventDeleteId = item.id;
  }

  /**
   * 确认删除复杂事件,提交
   * */
  private deleteComplexEventSubmit(): void {
    this.deleteComplexEventIsVisible = false;
    this.eventService.deleteComplexEvent(this.complexEventDeleteId).subscribe(data => {
      this.getList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.complexEventDeleteId = null;//删除成功后置空
    });
  }

  //新增复杂事件取消按钮
  handleCancel(): void {
    this.insertComplexEventIsVisible = false;
    this.deleteComplexEventIsVisible = false;
    this.complexEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
    });
  }

  /**
   * 新增复杂事件弹出框
   * */
  private addComplexEvent(item):void {
    this.insertComplexEventIsVisible = true;
  }

  /**
   * 复杂事件新增或修改  提交到后台
   * */
  private submitComplexEvent(): void {
    let complextEvent: KnowledgeComplexEvent = new KnowledgeComplexEvent();
    complextEvent.id = this.complexEventUpdateId;
    complextEvent.name = this.complexEventForm.value.name;
    complextEvent.synopsis = this.complexEventForm.value.synopsis;
    this.eventService.addComplexEvent(complextEvent).subscribe(data => {
      this.insertComplexEventIsVisible = false;
      this.getList();
      this.complexEventUpdateId = null;
      if (data.data.message != 'success') {
        this.notification.create("error",
            '提示', this.complexEventForm.value.name + '已存在！'
          );
          return;
      }
    });
  }

  /**
   * 修改复杂事件弹出框（使用新增的弹出框，把值赋上即可）
   * */
  private updateComplexEvent(item): void {
    this.insertComplexEventIsVisible = true;
    this.complexEventForm = this.fb.group({
      name: [item.name, [Validators.required]],
      synopsis: [item.synopsis, [Validators.required]],
    });
    this.complexEventUpdateId = item.id;
  }

  /**
   * 当选择原子事件时，去后台拉取对应的已绑定属性
   * */
  private metaEventChange(e): void{
    this.eventService.getMeteEventAttrById(e).subscribe(data => {
      this.metaAttributeList = data.data;
    });
  }

  private metaEventRangeChange(e): void {
    this.checkRange = e;
  }

  //---------------------------

  /**
   * 打开所选原子事件弹出框,选择新增原子事件
   * */
  addOrUpdateMeta(item) {
    this.addMetaIsVisible = true;
    this.complexId = item.id;
    this.getMetaList();//获取对应关系列表
  }

  /**
   * 获取所选原子事件列表
   * */
  private getMetaList(): void {
    this.eventService.getAllSubEvent(this.complexId).subscribe(data => {
      let subEvents:KnowledgeComplexSubEvent[] = data.data;
      this.metaList = Array(subEvents.length)
        .fill({}).map((item: any, idx: number) => {
          if (subEvents[idx].attributeRelation === '0') {
            this.attributeRelationInfo = "小于"
          } else if (subEvents[idx].attributeRelation === '1') {
            this.attributeRelationInfo = "小于等于"
          } else if (subEvents[idx].attributeRelation === '2') {
            this.attributeRelationInfo = "等于"
          } else if (subEvents[idx].attributeRelation === '3') {
            this.attributeRelationInfo = "大于等于"
          } else if (subEvents[idx].attributeRelation === '4') {
            this.attributeRelationInfo = "大于"
          } else if (subEvents[idx].attributeRelation === '5') {
            this.attributeRelationInfo = "between"
          } else if (subEvents[idx].attributeRelation === '6') {
            this.attributeRelationInfo = "不等于"
          } else if (subEvents[idx].attributeRelation === '7') {
            this.attributeRelationInfo = "in"
          }
          return {
            id: subEvents[idx].id,
            subeventRange: subEvents[idx].subeventRange,
            subeventName: subEvents[idx].subeventName,
            metaAttribute: subEvents[idx].attrName,
            attributeRelation: this.attributeRelationInfo,
            relationValue: subEvents[idx].relationValue,
          }
        })
    });
  }

  //所选原子事件的取消按钮方法
  addMetaHandleCancel(): void {
    this.addMetaIsVisible = false;
    this.complexId = null;
  }

  //新增所选原子事件
  addMeta() {
    this.saveMetaIsVisible = true;
  }

  //新增所选原子事件的取消按钮方法
  saveMetaHandleCancel(): void {
    this.saveMetaIsVisible = false;
    this.editSubEventId = null;
    this.metaForm = this.fb.group({
      metaEventRange:[null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      metaAttribute: [null, [Validators.required]],
      metaEventRelation: [null, [Validators.required]],
      metaEventValue: [null, [Validators.required]],
    });
  }

  /**
   * 提交或修改保存所选原子事件
   * */
  private submitMeta(): void {
    let subEvent: KnowledgeComplexSubEvent = new KnowledgeComplexSubEvent();
    subEvent.attributeRelation = this.metaForm.value.metaEventRelation;
    subEvent.attrName = this.metaForm.value.metaAttribute;
    subEvent.complexEventId = this.complexId;
    subEvent.relationValue = this.metaForm.value.metaEventValue;
    subEvent.subeventId = this.metaForm.value.selectMeta;
    subEvent.subeventName = this.metaEventMap.get(subEvent.subeventId);
    subEvent.subeventRange = this.metaForm.value.metaEventRange;
    if (this.editSubEventId != null) subEvent.id = this.editSubEventId;
    this.editSubEventId = null;
    this.eventService.addComplexSubEvent(subEvent).subscribe(data => {
      this.saveMetaHandleCancel();
      this.getMetaList();
    });
  }

  /**
   * 删除所选原子事件
   * */
  private deleteMeta(item): void {
    this.deleteMetaIsVisible = true;
    this.deleteMetaId = item.id;
  }

  //删除所选原子事件取消按钮方法
  deleteMetaHandleCancel(): void {
    this.deleteMetaIsVisible = false;
    this.deleteMetaId = null;
  }

  /**
   * 删除所选子事件,处理提交
   * */
  private deleteMetaSubmit(): void {
    this.deleteMetaIsVisible = false;
    this.eventService.deleteComplexSubEvent(this.deleteMetaId).subscribe(data => {
      this.getMetaList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteMetaId = null;//删除成功后置空
    });
  }

//-----------------------------
  //打开属性关系弹出框
  addOrUpdateAttribute(item) {
    this.addAttributeIsVisible = true;
    this.complexId = item.id;
    this.getAttributeList();//获取对应关系列表
  }

  //获取属性关系列表
  getAttributeList() {
    this.http.get('api/complexEvent/infoList/getAttributeList', {
      complexId: this.complexId
    }).subscribe(data => {
      this.attributeList = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          if (data[idx].attributeRelation === '0') {
            this.attributeRelationInfo = "小于"
          } else if (data[idx].attributeRelation === '1') {
            this.attributeRelationInfo = "小于等于"
          } else if (data[idx].attributeRelation === '2') {
            this.attributeRelationInfo = "等于"
          } else if (data[idx].attributeRelation === '3') {
            this.attributeRelationInfo = "大于等于"
          } else if (data[idx].attributeRelation === '4') {
            this.attributeRelationInfo = "大于"
          } else if (data[idx].attributeRelation === '5') {
            this.attributeRelationInfo = "between"
          } else if (data[idx].attributeRelation === '6') {
            this.attributeRelationInfo = "不等于"
          } else if (data[idx].attributeRelation === '7') {
            this.attributeRelationInfo = "in"
          }
          if (data[idx].type == "1") {
            this.typrInfo = "属性"
          } else if (data[idx].type == "2") {
            this.typrInfo = "目标"
          }
          return {
            id: data[idx].id,
            type: this.typrInfo,
            attributeName: data[idx].attributeName,
            attributeRelation: this.attributeRelationInfo,
            attributeValue: data[idx].attributeValue,
          }
        })
    })
  }

  //所选属性关系的取消按钮方法
  addAttributeHandleCancel(): void {
    this.addAttributeIsVisible = false;
    this.complexId = null;
  }

  //新增所选属性关系
  addAttribute() {
    this.saveAttributeIsVisible = true;
  }

  //新增所选属性关系的取消按钮方法
  saveAttributeHandleCancel(): void {
    this.saveAttributeIsVisible = false;
    this.attributeForm = this.fb.group({
      // selectType: [null, [Validators.required]],
      attributeName: [null, [Validators.required]],
      attributeRelation: [null, [Validators.required]],
      attributeValue: [null, [Validators.required]],
    });
  }

  //选择的属性关系
  relationChange(e) {
    this.checkRelation = e;
  }

  //提交保存所选属性关系
  submitAttribute() {
    this.http.post('api/complexEvent/infoList/addAttributeList', {
      type: '1',
      // type: this.attributeForm.value.selectType,
      attributeName: this.attributeForm.value.attributeName,
      attributeRelation: this.attributeForm.value.attributeRelation,
      attributeValue: this.attributeForm.value.attributeValue,
      complexEventId: this.complexId,
    }).subscribe(data => {
      this.saveAttributeHandleCancel();
      this.getAttributeList();
    })
  }

  //删除所选属性关系
  deleteAttribute(item) {
    this.deleteAttributeIsVisible = true;
    this.deleteAttributeId = item.id;
    console.log(item);
  }

  //删除所选属性关系取消按钮方法
  deleteAttributeHandleCancel(): void {
    this.deleteAttributeIsVisible = false;
    this.deleteAttributeId = '';
  }

  //删除所选属性关系提交
  deleteAttributeSubmit() {
    this.deleteAttributeIsVisible = false;
    this.http.delete('api/complexEvent/infoList/deleteAttribute/' + this.deleteAttributeId).subscribe(data => {
      this.getAttributeList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteAttributeId = '';//删除成功后置空
    })
  }


  //打开目标关系弹出框
  addOrUpdateTarget(item) {
    this.addTargetIsVisible = true;
    this.complexId = item.id;
    this.getTargetList();//获取对应关系列表
  }

  /**
   * 获取目标关系列表
   * */
  private getTargetList(): void{
    this.eventService.getAllTarget(this.complexId).subscribe(data => {
      let targets: KnowledgeComplexTarget[] = data.data;
      this.targetList = Array(targets.length)
        .fill({}).map((item: any, idx: number) => {
          if (targets[idx].attributeRelation === '0') {
            this.attributeRelationInfo = "小于"
          } else if (targets[idx].attributeRelation === '1') {
            this.attributeRelationInfo = "小于等于"
          } else if (targets[idx].attributeRelation === '2') {
            this.attributeRelationInfo = "等于"
          } else if (targets[idx].attributeRelation === '3') {
            this.attributeRelationInfo = "大于等于"
          } else if (targets[idx].attributeRelation === '4') {
            this.attributeRelationInfo = "大于"
          } else if (targets[idx].attributeRelation === '5') {
            this.attributeRelationInfo = "between"
          } else if (targets[idx].attributeRelation === '6') {
            this.attributeRelationInfo = "不等于"
          } else if (targets[idx].attributeRelation === '7') {
            this.attributeRelationInfo = "in"
          }
          return {
            id: targets[idx].id,
            subeventName: targets[idx].subeventName,
            metaAttribute: targets[idx].attrName,
            targetRelation: this.attributeRelationInfo,
            relationValue: targets[idx].relationValue,
            timeWindow: targets[idx].timeWindow,
            lenWindow: targets[idx].lenWindow,
          }
        })
    });
  }

//所选目标关系的取消按钮方法
  addTargetHandleCancel(): void {
    this.addTargetIsVisible = false;
    this.complexId = null;
  }

  //新增所选目标关系
  addTarget() {
    this.saveTargetIsVisible = true;
  }

  /**
   * 新增所选目标关系的取消按钮方法
   * */
  private saveTargetHandleCancel(): void {
    this.saveTargetIsVisible = false;
    this.editTargetId = null;
    this.targetForm = this.fb.group({
      //selectAndOrNot: [null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      //targetName: [null, [Validators.required]],
      metaAttribute: [null, [Validators.required]],
      targetRelation: [null, [Validators.required]],
      targetValue: [null, [Validators.required]],
      timeWindow:[null],
      lenWindow:[null],
    });
  }

  // //选择的目标关系
  // relationChange(e) {
  //   this.checkRelation = e;
  // }

  /**
   * 提交保存所选目标关系
   * */
  private submitTarget(): void {
    let target: KnowledgeComplexTarget = new KnowledgeComplexTarget();
    target.attributeRelation = this.targetForm.value.targetRelation;
    target.attrName = this.targetForm.value.metaAttribute;
    target.complexEventId = this.complexId;
    target.relationValue = this.targetForm.value.targetValue;
    target.subeventId = this.targetForm.value.selectMeta;
    target.subeventName = this.metaEventMap.get(target.subeventId);
    target.timeWindow = this.targetForm.value.timeWindow;
    target.lenWindow = this.targetForm.value.lenWindow;
    if (this.editTargetId != null) target.id = this.editTargetId;
    this.editTargetId = null;
    this.eventService.addComplexTarget(target).subscribe(data => {
      this.saveTargetHandleCancel();
      this.getTargetList();
    });
  }

  /**
   * 删除所选目标关系
   * */
  private deleteTarget(item): void {
    this.deleteTargetIsVisible = true;
    this.deleteTargetId = item.id;
  }

  //删除所选目标关系取消按钮方法
  deleteTargetHandleCancel(): void {
    this.deleteTargetIsVisible = false;
    this.deleteTargetId = '';
  }

  /**
   * 删除所选目标关系提交
   * */
  deleteTargetSubmit() {
    this.deleteTargetIsVisible = false;
    this.eventService.deleteComplexTarget(this.deleteTargetId).subscribe(data => {
      this.getTargetList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteTargetId = null;//删除成功后置空
    });
  }

//--------------------------------------
  warn(complexId : number) {
    // setInterval()
    if (this.timerMap.has(complexId)) return;
    let timer = setInterval(() => {
      this.http.get('api/complexevent/getDeduceResult', {}).subscribe(data => {
        let complexEvents: KnowledgeComplexEvent[] = data.data;
        // if(data.type === "1"){
        //   if(this.warnType  === 1){
        //     this.warnType = 2;
        //     this.warn1();
        //   }
        // }
        // if(data.type === "2"){
        //   if(this.warnType  === 2){
        //     this.warnType = 0;//结束
        //     this.warn2();
        //   }
        // }
        // if (this.stopTimer == true) {
        //   clearInterval(timer);
        //   this.stopTimer = false;
        // }
        complexEvents.forEach(e => {
          this.notification.create(
            //error，warning,info
            "error",
            '站点报警',//标题
            '<table border="1"><tr><td>系统</td><td>复杂事件</td><td>复杂事件说明</td><td>站点</td></tr>' +
            '<tr bgcolor="87cefa"><td>授时系统</td><td>'+ e.name+'</td><td>'+e.synopsis+'</td><td>西安站</td></tr></table>',//在这里写表格内容
            {
              nzStyle: {width: '800px', marginLeft: '-400px'},//弹出框的样式，分别是宽度，左距离，颜色
              nzDuration: 20000,//显示时间，单位是毫秒，0为一直显示，不自动关闭
            }
          );
        });
      });
    }, 5000);
    this.timerMap.set(this.complexId, timer);
  }

  warn1() {
    // let time = new Date();
    let time =this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.notification.create(
      //error，warning,info
      "error",
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td><td>故障等级</td><td>值</td><td>时间</td><td>类型</td></tr>' +
      '<tr bgcolor="87cefa"><td>授时系统</td><td>西安站</td><td>光纤光频传递分系统</td><td>光频传递系统接收设备1</td><td>低</td><td>55</td><td>'+time+'</td><td>单一复杂事件</td></tr></table>',//在这里写表格内容
      {
        nzStyle: {width: '800px', marginLeft: '-400px'},//弹出框的样式，分别是宽度，左距离，颜色
        nzDuration: 20000,//显示时间，单位是毫秒，0为一直显示，不自动关闭
      }
    );
    this.time1 = time;
  }

  warn2() {
    const time1 = this.time1;
    let time2 =this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.notification.create(
      //error，warning,info
      "error",
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td><td>故障等级</td><td>值</td><td>时间</td><td>类型</td></tr>' +
      '<tr bgcolor="red"><td>授时系统</td><td>北京站</td><td>光纤光频传递分系统</td><td>光频传递系统接收设备3</td><td>高</td><td>56</td><td>'+time2+'</td><td>复合复杂事件</td></tr>' +
      '<tr bgcolor="#ff8c00"><td>授时系统</td><td>北京站</td><td>光纤光频传递分系统</td><td>光频传递系统接收设备2</td><td>中</td><td>56</td><td>'+time2+'</td><td>复合复杂事件</td></tr>' +
      '<tr bgcolor="#87cefa"><td>授时系统</td><td>北京站</td><td>光纤光频传递分系统</td><td>光频传递系统接收设备1</td><td>低</td><td>55</td><td>'+time1+'</td><td>单一复杂事件</td></tr></table>',//在这里写表格内容
      {
        nzStyle: {width: '800px', marginLeft: '-400px',},//弹出框的样式，分别是宽度，左距离，颜色
        nzDuration: 0,//显示时间，单位是毫秒，0为一直显示，不自动关闭
      }
    );
    this.stopTimer = true;
  }

  warn3() {
    this.notification.create(
      //error，warning,info
      "error",
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td><td>报警信息</td></tr>' +
      '<tr><td>授时系统</td><td>北京站</td><td>子系统1</td><td>设备1</td><td>失锁</td></tr>' +
      '<tr><td>授时系统</td><td>北京站</td><td>子系统1</td><td>设备2</td><td>自动重锁</td></tr>' +
      '<tr><td>授时系统</td><td>北京站</td><td>子系统1</td><td>设备3</td><td>重锁失败</td></tr></table>',//在这里写表格内容
      {
        nzStyle: {width: '470px', marginLeft: '-100px', color: 'red'},//弹出框的样式，分别是宽度，左距离，颜色
        nzDuration: 0,//显示时间，单位是毫秒，0为一直显示，不自动关闭
      }
    );
    this.stopTimer = true;
  }

  /**
   * 开始推理复杂事件
   * */
  timerMap : Map<number, NodeJS.Timer> = new Map<number, NodeJS.Timer>();
  private deduce(item): void {
    // this.notification.create(
    //   //error，warning,info
    //   type,
    //   '站点报警',//标题
    //   '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td></tr><tr><td>1111111</td><td>222222222222</td><td>3333</td><td>444444</td></tr></table>',//在这里写表格内容
    //   {
    //     nzStyle: {width: '470px', marginLeft: '-100px', color: 'red'},//弹出框的样式，分别是宽度，左距离，颜色
    //     nzDuration: 0,//显示时间，单位是毫秒，0为一直显示，不自动关闭
    //   }
    // );
    this.complexId = item.id;
    this.eventService.deduce(this.complexId).subscribe(data => {
      let id :number = data.data;
      this.notification.blank(
        'Success',
        '复杂事件:' + this.complexEvents.get(id).name + ' 开始推理'
      );
    });
    this.warn(this.complexId);
    this.complexId = null;
  }//nzDuration是毫秒

  /**
   * 显示新增原子事件逻辑关系表单
   * */
  private addLogicRelation(item): void {
    this.insertMetaEventLogicRelationIsVisible = true;
    this.complexId = item.id;
    this.fullLogicRelation = this.complexEvents.get(this.complexId).relation;
    this.eventService.getAllSubEventRelation(this.complexId).subscribe(data => {
      this.subEventRelationList = data.data;
      this.subEventRelationMap.clear();
      this.subEventRelationList.forEach((a)=> {
        this.subEventRelationMap.set(a.id, a);
      })
    });
  }

  /**
   * 显示新增目标逻辑关系表单
   * */
  private addTargetRelation(item): void {
    this.insertTargetLogicRelationIsVisible = true;
    this.complexId = item.id;
    this.fullTargetLogicRelation = this.complexEvents.get(this.complexId).targetRelation;
    this.eventService.getAllTargetRelation(this.complexId).subscribe(data => {
      this.targetRelationList = data.data;
      this.targetRelationMap.clear();
      this.targetRelationList.forEach((a)=> {
        this.targetRelationMap.set(a.id, a);
      })
    });
  }
  /**
   * 编辑原子事件关系表单取消
   * */
  private handleMetaEventLogicRelationCancel(): void {
    this.insertMetaEventLogicRelationIsVisible = false;
    this.complexId = null;
    this.metaEventLogicRelationForm = this.fb.group({
      formulaA: [null, [Validators.required]],
      formulaB: [null, [Validators.required]],
      lrelation: [null, [Validators.required]],
    });
  }

  /**
   * 编辑目标逻辑关系表单取消
   * */
  private handleTargetLogicRelationCancel(): void {
    this.insertTargetLogicRelationIsVisible = false;
    this.complexId = null;
    this.targetLogicRelationForm = this.fb.group({
      formulaA: [null, [Validators.required]],
      formulaB: [null, [Validators.required]],
      lrelation: [null, [Validators.required]],
    });
  }
  /**
   * 处理原子事件逻辑关系提交
   * */
  private submitMetaEventLogicRelation(): void{
    let left = this.metaEventLogicRelationForm.value.formulaA;
    let right = this.metaEventLogicRelationForm.value.formulaB;
    let lr = this.metaEventLogicRelationForm.value.lrelation;

    this.eventService.addMetaEventRelation(left,right,lr,this.complexId)
      .subscribe(data => {
        /**
         * 重新获取复杂事件列表
         * */
        this.getList();
        /**
         * 重新获取子事件关系列表
         * */
        this.eventService.getAllSubEventRelation(this.complexId).subscribe(data => {
          this.subEventRelationList = data.data;
          this.subEventRelationMap.clear();
          this.subEventRelationList.forEach((a)=> {
            this.subEventRelationMap.set(a.id, a);
          })
          this.handleMetaEventLogicRelationCancel();
        });
      });
  }
  /**
   * 处理目标逻辑关系提交
   * */
  private submitTargetLogicRelation(): void{
    let left = this.targetLogicRelationForm.value.formulaA;
    let right = this.targetLogicRelationForm.value.formulaB;
    let lr = this.targetLogicRelationForm.value.lrelation;

    this.eventService.addTargetRelation(left,right,lr,this.complexId)
      .subscribe(data => {
        /**
         * 重新获取复杂事件列表
         * */
        this.getList();
        /**
         * 重新获取目标关系列表
         * */
        this.eventService.getAllTargetRelation(this.complexId).subscribe(data => {
          this.targetRelationList = data.data;
          this.targetRelationMap.clear();
          this.targetRelationList.forEach((a)=> {
            this.targetRelationMap.set(a.id, a);
          })
          this.handleTargetLogicRelationCancel();
        });
      });
  }

  private resetSubEventRelation($event: MouseEvent): void {
    this.eventService.deleteSubEventRelation(this.complexId).subscribe(data => {
      if (data.message == 'success') {
        this.notification.create("success",
          '提示',
          '删除成功！'
        );
      }
    });
  }

  private resetTargetRelation($event: MouseEvent): void {
    this.eventService.deleteTargetRelation(this.complexId).subscribe(data => {
      if (data.message == 'success') {
        this.notification.create("success",
          '提示',
          '删除成功！'
        );
      }
    });
  }

  private stopDeduce(item) : void {
    this.eventService.stopDeduce(item.id).subscribe(data => {
      let id :number = data.data;
      this.notification.blank(
        'Success',
        '复杂事件:' + this.complexEvents.get(id).name + ' 停止推理'
      );
    });
    let timer: NodeJS.Timer = this.timerMap.get(item.id);
    if (timer != null) {
      clearInterval(Number(timer));
      this.timerMap.delete(item.id);
    }
  }

  private editMeta(item) : void {
    this.editSubEventId = item.id;
    this.saveMetaIsVisible = true;
  }

  private editTarget(item) : void {
    this.editTargetId = item.id;
    this.saveTargetIsVisible = true;
  }

  // knowledgeTotal: SFSchemaEnum[] = [];
  //   // knowledgeCur: any[] = [];
  //   // private freshSelectedKnowledge(id: number): void {
  //   //   this.directoryService.getAllKnowledge(null, null, null, null).subscribe(data=> {
  //   //       let knowledges:KnowledgeDetail[] = data.data;
  //   //       this.eventService.getSelectedKnowledge(id).subscribe(selectedData=> {
  //   //           let selectedKnowledges:KnowledgeDetail[] = selectedData.data;
  //   //           let diff:KnowledgeDetail[] = knowledges.filter(k => !selectedKnowledges.includes(k));
  //   //           knowledges.forEach(k => {
  //   //             this.knowledgeTotal.push({title:k.knowledgeName, value:k.knowledgeId});
  //   //           });
  //   //
  //   //           diff.forEach(d => {
  //   //             this.knowledgeCur.push(d.knowledgeId);
  //   //           });
  //   //           this.selectKnowledgeSchema.properties.roles.enum = this.knowledgeTotal;
  //   //           this.selectKnowledgeSchema.properties.roles.default = this.knowledgeCur;
  //   //           this.sfSelectedKnowledge.refreshSchema();
  //   //       });
  //   //   });
  //   // }

  private sparqlSelectKnowledge(item) : void {
    this.sparqlSelectKnowledgeIsVisible = true;
    this.complexId = item.id;
  }

  private spqralSelectKnowledgeHandleCancel(): void {
    this.sparqlSelectKnowledgeIsVisible = false;
    this.complexId = null;
  }

  private saveKnowledgeForComplexEvent(item): void {
    let s:string = this.sfSparalSelectedKnowledge.getValue("/remark2");
    if (s == null) s = "";
    let arr:string[] = s.split("\n");
    if (s == "") arr = [];
    let knowledgeIds:number[] = [];
    arr.forEach(item=> {
      knowledgeIds.push(Number(item.substring(item.indexOf("(") + 1, item.length-1)));
    });
    console.log(knowledgeIds);
    this.eventService.saveKnowledgeForEvent(this.complexId, knowledgeIds).subscribe();
  }

  private getAllSelectedKnowledge(item): void {
    this.eventService.getSelectedKnowledge(this.complexId).subscribe(data=>{
      let knowledges: KnowledgeKnowledge[] = data.data;
      let s: string = "";
      knowledges.forEach(k=>{s += k.knowledgeName + "(" + k.id+")" + "\n"});
      this.sfSparalSelectedKnowledge.setValue("/remark2", s);
    });
  }

  private getKnowledgeBySparql(item): void {
    this.eventService.getKnowledgeBySparsql(this.sfSparalSelectedKnowledge.getValue("/remark1")).subscribe(data=> {
      let knowledges:KnowledgeKnowledge[] = data.data;
      let s: string = "";
      knowledges.forEach(k=>{s += k.knowledgeName + "(" + k.id+")" + "\n"});
      this.sfSparalSelectedKnowledge.setValue("/remark2", s);
    });
  }

  insertFormulaIsVisiable: boolean = false;

  knowledgeShow: any = [];
  knowledgeIdNameMap: Map<number, string> = new Map<number, string>();
  private insertFormula(item): void {
    this.insertFormulaIsVisiable = true;
    this.complexId = item.id;
    this.eventService.getAllKnowledge().subscribe(data => {
      let knowledges:KnowledgeKnowledge[] = data.data;
      knowledges.forEach(k => {
        this.knowledgeShow.push({label:k.knowledgeUri, value:k.id});
        this.knowledgeIdNameMap.set(k.id, k.knowledgeUri);
      });
      this.insertFormulaSchema.properties.knowledge.enum = this.knowledgeShow;
      this.sfinsertFormula.refreshSchema();
    });
  }

  private insertFormulaHandleCancel(): void {
    this.insertFormulaIsVisiable = false;
    this.complexId = null;
    this.knowledgeShow = [];
    this.knowledgeIdNameMap = new Map<number, string>();
  }

  appendKnowledgesRelation() {
    this.sfinsertFormula.setValue("/relation", this.sfinsertFormula.getValue("/relation") + this.knowledgeIdNameMap.get(Number(this.sfinsertFormula.getValue("/knowledge"))));
  }

  private insertFormulaForComplexEvent(): void {
    let f: KnowledgeFomula = new KnowledgeFomula();
    f.fomulaName = this.sfinsertFormula.getValue("/name");
    f.isGlobal = this.sfinsertFormula.getValue("/btn1");
    f.isComplete = this.sfinsertFormula.getValue("/btn2");
    f.foluma = this.sfinsertFormula.getValue("/globalFormula");
    f.relation = this.sfinsertFormula.getValue("/relation");
    this.eventService.addFolumaKnowledge(f).subscribe(data => {

    });
  }


  selectKnowledgeIsVisible: boolean = false;

  private selectKnowledge(item):void {
    this.selectKnowledgeIsVisible = true;
    this.complexId = item.id;
  }

  private selectKnowledgeHandleCancel(): void {
    this.selectKnowledgeIsVisible = false;
    this.complexId = null;
  }


  deleteKnowledges() {
    this.eventService.saveKnowledgeForEvent(this.complexId, []).subscribe();
  }

  submitForSelectKnowledge($event: MouseEvent) {

  }


  selectUncompletedFormulaIsVisiable: boolean = false;
  selectCompletedFormulaIsVisiable: boolean = false;
  /**
   * 选择增加未完成公式
   * if (targets[idx].attributeRelation === '0') {
            this.attributeRelationInfo = "小于"
          } else if (targets[idx].attributeRelation === '1') {
            this.attributeRelationInfo = "小于等于"
          } else if (targets[idx].attributeRelation === '2') {
            this.attributeRelationInfo = "等于"
          } else if (targets[idx].attributeRelation === '3') {
            this.attributeRelationInfo = "大于等于"
          } else if (targets[idx].attributeRelation === '4') {
            this.attributeRelationInfo = "大于"
          } else if (targets[idx].attributeRelation === '5') {
            this.attributeRelationInfo = "between"
          } else if (targets[idx].attributeRelation === '6') {
            this.attributeRelationInfo = "不等于"
          } else if (targets[idx].attributeRelation === '7') {
            this.attributeRelationInfo = "in"
          }
   * */
  @ViewChild('sfUncompletedSelectFomula', { static: true }) sfUncompletedSelectFomula: SFComponent;
  selectUncompletedFomulaSchema: SFSchema = {
    properties: {
      fomulaName: {
        type: 'string',
        title: '已完成公式选择',
        enum: [
          { label: '光频稳定度平方公式', value: 'WAIT_BUYER_PAY', otherData: 1 },
        ],
        default: 'WAIT_BUYER_PAY',
        ui: {
          widget: 'select',
          change: (value, orgData) => console.log(value, orgData),
        } as SFSelectWidgetSchema,
      },
      relation: {
        type: 'string',
        title: '对应关系',
        enum: [
          { label: '小于', value: 0 },
          { label: '小于等于', value: 1 },
          { label: '等于', value: 2 },
          { label: '大于等于', value: 3 },
          { label: '大于', value: 4 },
          { label: 'between', value: 5 },
          { label: '不等于', value: 6 },
          { label: 'in', value: 7 },
        ],
        ui: {
          widget: 'select',
        } as SFSelectWidgetSchema,
      },
      value: {
        type: 'string',
        title: '值(范围)',
      },
      remark: {
        type: 'string',
        title: '已添加公式',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 6, maxRows: 16 },
        } as SFTextareaWidgetSchema,
      },
    },
  };

  /**
   * 选择增加已完成公式
   * */
  @ViewChild('sfCompletedSelectFomula', { static: true }) sfCompletedSelectFomula: SFComponent;
  selectCompletedFomulaSchema: SFSchema = {
    properties: {
      fomulaName: {
        type: 'string',
        title: '已完成公式选择',
        enum: [
          { label: '光频稳定度平方公式', value: 'WAIT_BUYER_PAY', otherData: 1 },
        ],
        default: 'WAIT_BUYER_PAY',
        ui: {
          widget: 'select',
          change: (value, orgData) => console.log(value, orgData),
        } as SFSelectWidgetSchema,
      },
      remark: {
        type: 'string',
        title: '已添加公式',
        ui: {
          widget: 'textarea',
          autosize: { minRows: 6, maxRows: 16 },
        } as SFTextareaWidgetSchema,
      },
    },
  };

  private addUncompletedFormula(item: any) {
    this.selectUncompletedFormulaIsVisiable = true;
    this.complexId = item.id;
  }

  private addCompletedFormula(item: any) {
    this.selectCompletedFormulaIsVisiable = true;
    this.complexId = item.id;
  }

  selectUncompletedFormulaHandleCancel() {
    this.selectUncompletedFormulaIsVisiable = false;
    this.complexId = null;
  }

  selectCompletedFormulaHandleCancel() {
    this.selectCompletedFormulaIsVisiable = false;
    this.complexId = null;
  }
}
