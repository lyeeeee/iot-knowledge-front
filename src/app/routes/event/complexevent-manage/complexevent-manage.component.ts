import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc/table';
import { SFSchema } from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzNotificationService} from "ng-zorro-antd";
import {DatePipe} from "@angular/common";

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
  saveMetaIsVisible;//是否显示新增选择元知识弹出框
  deleteMetaIsVisible;//是否显示删除选择元知识弹出框
  addAttributeIsVisible;//是否显示添加属性弹出框
  saveAttributeIsVisible;//是否显示新增添加属性弹出框
  deleteAttributeIsVisible;//是否显示删除添加属性弹出框
  addTargetIsVisible;//是否显示添加目标弹出框
  saveTargetIsVisible;//是否显示新增目标弹出框
  deleteTargetIsVisible;//是否显示删目标弹出框

  name = '';//复杂事件名称
  complexEventName: any[] = [];//存放所有已存在的复杂事件名称，更新及新增时检查是否已存在
  complexEventUpdateId = '';//修改复杂事件id
  complexEventDeleteId = '';//删除复杂事件id
  complexId = "";
  allMetaList: any[] = [];//存放所有原子事件
  checkMeta = '';//所选原子事件
  checkRelation = '';//所选属性关系
  deleteMetaId = '';//要删除的原子事件的id
  deleteAttributeId = '';//要删除的属性关系的id
  deleteTargetId = '';
  attributeRelationInfo = '';//属性关系展示信息
  metaEventCompany = '';//原子事件范围单位展示信息
  relationList: any[] = [{value: 0, label: "小于"}, {value: 1, label: "小于等于"}, {value: 2, label: "等于"},
    {value: 3, label: "大于等于"}, {value: 4, label: "大于"},];
  metaEventCompanyList: any[] = [{value: "subsites", label: "子站"}, {value: "subsystem", label: "子系统"},
    {value: "equipment", label: "设备"}, {value: "target", label: "属性"}];
  metaEventRangeList: any[] = [];
  checkCompany = "";
  checkRange = "";
  typeList: any[] = [{value: "2", label: "目标"}, {value: "1", label: "属性"}];
  andOrNotList: any[] = [{value: "1", label: "与"}, {value: "2", label: "或"}, {value: "3", label: "非"}];
  // targetNameList: any[] = [{value: "00", label: "失锁"}, {value: "01", label: "自动重锁"}, {value: "02", label: "重锁失败"}];
  targetNameList: any[] = [{
    label: "链路光纤故障",
    value: "0",
    "children": [{label: "失锁", value: "00", isLeaf: true}, {label: "自动重锁", value: "01", isLeaf: true}, {
      label: "重锁失败",
      value: "02",
      isLeaf: true
    }]
  },
    {
      label: "2故障",
      value: "1",
      "children": [{label: "10", value: "10", isLeaf: true}, {label: "11", value: "11", isLeaf: true}, {
        label: "12",
        value: "12",
        isLeaf: true
      }]
    }];
  metaAttributeList: any[] = [{value: "EDFA锁定状态", label: "EDFA锁定状态"}, {value: "光源锁定状态", label: "光源锁定状态"}, {value: "再生光激光器锁定状态", label: "再生光激光器锁定状态"}
    , {value: "电源状态", label: "电源状态"}, {value: "设备工作状态", label: "设备工作状态"}, {value: "链路锁定状态", label: "链路锁定状态"}
    , {value: "光频传递指标", label: "光频传递指标"}, {value: "再生光输出功率", label: "再生光输出功率"}, {value: "发送端输出功率", label: "发送端输出功率"}
    , {value: "接收端输入功率", label: "接收端输入功率"}, {value: "环内拍频信号", label: "环内拍频信号"}, {value: "环境温度", label: "环境温度"}
    , {value: "相位噪声", label: "相位噪声"}, {value: "离子泵电流", label: "离子泵电流"}, {value: "输入功率", label: "输入功率"}
    , {value: "输出功率", label: "输出功率"}, {value: "透射峰电压", label: "透射峰电压"}, {value: "频率稳定度", label: "频率稳定度"}];

  checktype = "";
  typrInfo = "";
  andOrNot = "";//与或非
  targetName = "";
  warnType = 1;
  stopTimer = false;
  time1 = "";
  typeSum = 0;

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
  @ViewChild('st', { static: true }) st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '复杂事件名称', index: 'name'},
    {title: '复杂事件简介', index: 'synopsis'},
    // {title: '原子事件范围单位', index: 'metaEventCompany'},
    // {title: '原子事件范围', index: 'metaEventRange'},
    {title: '创建时间', index: 'insertTime'},
    {
      title: '操作',
      buttons: [
        {text: '选择原子事件', click: (item: any) => this.addOrUpdateMeta(item)},
        // {text: '编辑属性', click: (item: any) => this.addOrUpdateAttribute(item)},
        {text: '编辑目标', click: (item: any) => this.addOrUpdateTarget(item)},
        {text: '修改', click: (item: any) => this.updateComplexEvent(item)},
        {text: '删除', click: (item: any) => this.deleteComplexEvent(item)},
        // {text: '报警', click: (item: any) => this.createNotification("error")},
        // {text: '报警', click: (item: any) => this.aaaa()},
      ]
    }
  ];
  @ViewChild('metast', { static: true }) metast: STComponent;
  metaColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '原子事件范围单位', index: 'attributeName'},
    {title: '属性', index: 'metaAttribute'},
    {title: '关系', index: 'attributeRelation'},
    {title: '值(设备号)', index: 'attributeValue'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteMeta(item)},
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
    {title: 'id', index: 'id', iif: () => false},
    // {title: '类型', index: 'type'},
    {title: '名称', index: 'attributeName'},
    {title: '关系', index: 'attributeRelation'},
    {title: '值', index: 'attributeValue'},
    {title: '与或非', index: 'andOrNot'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteTarget(item)},
      ]
    }
  ];

  constructor(private notification: NzNotificationService,
              private fb: FormBuilder,
              private modal: ModalHelper,
              private http: _HttpClient,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getList();
    this.complexEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
      // selectCompany: [null, [Validators.required]],
      // selectRange: [null, [Validators.required]],
    });
    this.metaForm = this.fb.group({
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
      selectAndOrNot: [null, [Validators.required]],
      targetName: [null, [Validators.required]],
      targetRelation: [null, [Validators.required]],
      targetValue: [null, [Validators.required]],
    });


    this.warn();

  }

  //调用后台接口获取list数据
  getList() {
    this.complexEventName = [];
    this.http.get('api/complexEvent/infoList', {
      name: this.name
    }).subscribe(data => {
      this.list = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          this.complexEventName.push(data[idx].name);
          return {
            name: data[idx].name,
            synopsis: data[idx].synopsis,
            // metaEventCompany: data[idx].metaEventCompany,
            // metaEventRange: data[idx].metaEventRange,
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

  //删除复杂事件
  deleteComplexEvent(item) {
    this.deleteComplexEventIsVisible = true;
    this.complexEventDeleteId = item.id;
  }

  //确认删除后提交
  deleteComplexEventSubmit() {
    this.deleteComplexEventIsVisible = false;
    this.http.delete('api/complexEvent/infoList/deleteComplexEvent/' + this.complexEventDeleteId).subscribe(data => {
      this.getList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.complexEventDeleteId = '';//删除成功后置空
    })
  }

  //新增复杂事件取消按钮
  handleCancel(): void {
    this.insertComplexEventIsVisible = false;
    this.deleteComplexEventIsVisible = false;
    this.complexEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
      // selectCompany: [null, [Validators.required]],
      // selectRange: [null, [Validators.required]],
    });
  }

  //新增复杂事件弹出框
  addComplexEvent(item) {
    this.insertComplexEventIsVisible = true;
  }

  //复杂事件新增或修改  提交到后台
  submitComplexEvent() {
    //检查是否存在
    // if (!this.checkComplexEventName(this.complexEventForm.value.name)) {
    //   this.notification.create("error",
    //     '提示', this.complexEventForm.value.name + '已存在！'
    //   );
    //   return;
    // }
    //不存在则新增或修改
    this.http.post('api/complexEvent/infoList/insertComplexEvent', {
      name: this.complexEventForm.value.name,
      synopsis: this.complexEventForm.value.synopsis,
      // metaEventCompany: this.complexEventForm.value.selectCompany,
      // metaEventRange: this.complexEventForm.value.selectRange,
      id: this.complexEventUpdateId,
    }).subscribe(data => {
      this.insertComplexEventIsVisible = false;
      this.getList();
      this.complexEventUpdateId = '';
    })
  }

  //遍历检查复杂事件name中是否存在
  checkComplexEventName(name) {
    for (const complexEventName of this.complexEventName) {
      if (name === complexEventName) {
        return false;
      }
    }
    return true;
  }

  //修改弹出框（使用新增的弹出框，把值赋上即可）
  updateComplexEvent(item) {
    this.insertComplexEventIsVisible = true;
    this.complexEventForm = this.fb.group({
      name: [item.name, [Validators.required]],
      synopsis: [item.synopsis, [Validators.required]],
      // selectCompany: [item.metaEventCompany, [Validators.required]],
      // selectRange: [item.metaEventRange, [Validators.required]],
    });
    this.complexEventUpdateId = item.id;
  }

  //当选择属性范围时，去后台拉取对应的数据
  metaEventCompanyChange(e) {
    // this.checkCompany = e;
    // this.http.get('api/complexEvent/infoList/getMetaEventRange', {
    //   type: this.checkCompany
    // }).subscribe(data => {
    //   this.metaEventRangeList = data;
    // })
  }

  metaEventRangeChange(e) {
    this.checkRange = e;
  }

  //---------------------------

  //打开所选原子事件弹出框
  addOrUpdateMeta(item) {
    this.addMetaIsVisible = true;
    this.complexId = item.id;
    this.getMetaList();//获取对应关系列表
    // this.getAllMetaList();//获取所有原子事件
  }

  //获取所选原子事件列表
  getMetaList() {
    this.http.get('api/complexEvent/infoList/getMetaList', {
      complexId: this.complexId
    }).subscribe(data => {
      console.log(data);
      this.metaList = Array(data.length)
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
          }
          if (data[idx].attributeName === 'equipment') {
            this.metaEventCompany = "设备";
          } else if (data[idx].attributeName === 'attribute') {
            this.metaEventCompany = "属性";
          } else if (data[idx].attributeName === 'subsites') {
            this.metaEventCompany = "子站";
          } else if (data[idx].attributeName === 'subsystem') {
            this.metaEventCompany = "子系统";
          }
          return {
            id: data[idx].id,
            attributeName: this.metaEventCompany,
            metaAttribute: data[idx].metaAttribute,
            attributeRelation: this.attributeRelationInfo,
            attributeValue: data[idx].attributeValue,
          }
        })
    })
  }

  //获取所有原子事件
  getAllMetaList() {
    this.http.get('api/complexEvent/infoList/getAllMetaList', {}).subscribe(data => {
      this.allMetaList = data;
      console.log(this.allMetaList)
    })
  }

  //所选原子事件的取消按钮方法
  addMetaHandleCancel(): void {
    this.addMetaIsVisible = false;
    this.complexId = '';
  }

  //新增所选原子事件
  addMeta() {
    this.saveMetaIsVisible = true;
  }

  //新增所选原子事件的取消按钮方法
  saveMetaHandleCancel(): void {
    this.saveMetaIsVisible = false;
    this.metaForm = this.fb.group({
      selectMeta: [null, [Validators.required]],
      metaAttribute: [null, [Validators.required]],
      metaEventRelation: [null, [Validators.required]],
      metaEventValue: [null, [Validators.required]],
    });
  }

  //选择的原子事件
  metaChange(e) {
    this.checkMeta = e;
  }

  //提交保存所选原子事件
  submitMeta() {
    this.http.post('api/complexEvent/infoList/addMeta', {
      type: '0',
      // metaEventId: this.checkMeta,
      complexEventId: this.complexId,
      attributeName: this.metaForm.value.selectMeta,
      metaAttribute: this.metaForm.value.metaAttribute,
      attributeRelation: this.metaForm.value.metaEventRelation,
      attributeValue: this.metaForm.value.metaEventValue,
    }).subscribe(data => {
      this.saveMetaHandleCancel();
      this.getMetaList();
    })
  }

  //删除所选原子事件
  deleteMeta(item) {
    this.deleteMetaIsVisible = true;
    this.deleteMetaId = item.id;
    console.log(item)
  }

  //删除所选原子事件取消按钮方法
  deleteMetaHandleCancel(): void {
    this.deleteMetaIsVisible = false;
    this.deleteMetaId = '';
  }

  //删除所选原子事件提交
  deleteMetaSubmit() {
    this.deleteMetaIsVisible = false;
    this.http.delete('api/complexEvent/infoList/deleteMeta/' + this.deleteMetaId).subscribe(data => {
      this.getMetaList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteMetaId = '';//删除成功后置空
    })
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
    this.complexId = '';
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

  typeChange(e) {
    this.checktype = e;
  }

  //目标target--------------------------------------------------

  //打开目标关系弹出框
  addOrUpdateTarget(item) {
    this.addTargetIsVisible = true;
    this.complexId = item.id;
    this.getTargetList();//获取对应关系列表
  }

  //获取目标关系列表
  getTargetList() {
    this.http.get('api/complexEvent/infoList/getTargetList', {
      complexId: this.complexId
    }).subscribe(data => {
      this.targetList = Array(data.length)
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
          }
          if (data[idx].attributeName == "00") {
            this.targetName = "失锁"
          } else if (data[idx].attributeName == "01") {
            this.targetName = "自动重锁"
          } else if (data[idx].attributeName == "02") {
            this.targetName = "重锁失败"
          }
          if (data[idx].andOrNot == "1") {
            this.andOrNot = "与"
          } else if (data[idx].andOrNot == "2") {
            this.andOrNot = "或"
          } else if (data[idx].andOrNot == "3") {
            this.andOrNot = "非"
          }
          return {
            id: data[idx].id,
            attributeName: this.targetName,
            attributeRelation: this.attributeRelationInfo,
            attributeValue: data[idx].attributeValue,
            andOrNot: this.andOrNot,
          }
        })
    })
  }

//所选目标关系的取消按钮方法
  addTargetHandleCancel(): void {
    this.addTargetIsVisible = false;
    this.complexId = '';
  }

  //新增所选目标关系
  addTarget() {
    this.saveTargetIsVisible = true;
  }

  //新增所选目标关系的取消按钮方法
  saveTargetHandleCancel(): void {
    this.saveTargetIsVisible = false;
    this.targetForm = this.fb.group({
      selectAndOrNot: [null, [Validators.required]],
      targetName: [null, [Validators.required]],
      targetRelation: [null, [Validators.required]],
      targetValue: [null, [Validators.required]],
      // andOrNot: [null, [Validators.required]],
    });
  }

  // //选择的目标关系
  // relationChange(e) {
  //   this.checkRelation = e;
  // }

  //提交保存所选目标关系
  submitTarget() {
    // console.log(this.targetForm.value.targetName[1])
    this.http.post('api/complexEvent/infoList/addTargetList', {
      type: '2',
      // type: this.targetForm.value.selectType,
      attributeName: this.targetForm.value.targetName[1],
      attributeRelation: this.targetForm.value.targetRelation,
      attributeValue: this.targetForm.value.targetValue,
      andOrNot: this.targetForm.value.selectAndOrNot,
      complexEventId: this.complexId,
    }).subscribe(data => {
      this.saveTargetHandleCancel();
      this.getTargetList();
    })
  }

  //删除所选目标关系
  deleteTarget(item) {
    this.deleteTargetIsVisible = true;
    this.deleteTargetId = item.id;
    console.log(item);
  }

  //删除所选目标关系取消按钮方法
  deleteTargetHandleCancel(): void {
    this.deleteTargetIsVisible = false;
    this.deleteTargetId = '';
  }

  //删除所选目标关系提交
  deleteTargetSubmit() {
    this.deleteTargetIsVisible = false;
    this.http.delete('api/complexEvent/infoList/deleteTarget/' + this.deleteTargetId).subscribe(data => {
      this.getTargetList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteTargetId = '';//删除成功后置空
    })
  }

//--------------------------------------
  warn() {
    // setInterval()
    let timer = setInterval(() => {
      this.http.get('api/warn/warn', {}).subscribe(data => {
        console.log(data);
        if(data.type === "1"){
          if(this.warnType  === 1){
            this.warnType = 2;
            this.warn1();
          }
        }
        if(data.type === "2"){
          if(this.warnType  === 2){
            this.warnType = 0;//结束
            this.warn2();
          }
        }
        if (this.stopTimer == true) {
          clearInterval(timer);
          this.stopTimer = false;
        }
      })
    }, 2000)
  }

  warn1() {
    // let time = new Date();
    let time =this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    this.notification.create(
      //error，warning,info
      "error",
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td><td>故障等级</td><td>值</td><td>时间</td><td>类型</td></tr>' +
      '<tr bgcolor="87cefa"><td>授时系统</td><td>北京站</td><td>光纤光频传递分系统</td><td>光频传递系统接收设备1</td><td>低</td><td>55</td><td>'+time+'</td><td>单一复杂事件</td></tr></table>',//在这里写表格内容
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


  createNotification(type: string): void {
    this.notification.create(
      //error，warning,info
      type,
      '站点报警',//标题
      '<table border="1"><tr><td>系统</td><td>子站</td><td>子系统</td><td>设备</td></tr><tr><td>1111111</td><td>222222222222</td><td>3333</td><td>444444</td></tr></table>',//在这里写表格内容
      {
        nzStyle: {width: '470px', marginLeft: '-100px', color: 'red'},//弹出框的样式，分别是宽度，左距离，颜色
        nzDuration: 0,//显示时间，单位是毫秒，0为一直显示，不自动关闭
      }
    );
  }//nzDuration是毫秒

}
