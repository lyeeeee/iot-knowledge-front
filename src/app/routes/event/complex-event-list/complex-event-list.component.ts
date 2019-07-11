import {Component, OnInit, ViewChild} from '@angular/core';
import {_HttpClient, ModalHelper} from '@delon/theme';
import {STColumn, STComponent} from '@delon/abc';
import {SFSchema} from '@delon/form';
import {NzNotificationService} from "ng-zorro-antd";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-event-complex-event-list',
  templateUrl: './complex-event-list.component.html',
})
//发现一个bug，先记录，后修改：点击修改后，不修改并关闭修改窗口，再新增会修改掉点击修改的那条数据
export class EventComplexEventListComponent implements OnInit {

  list: any[] = [];
  metaList: any[] = [];//所选知识列表
  attributeList: any[] = [];//对应关系列表
  insertComplexEventIsVisible;//是否显示新增复杂事件弹出框
  deleteComplexEventIsVisible;//是否显示删除复杂事件弹出框
  addMetaIsVisible;//是否显示选择元知识弹出框
  saveMetaIsVisible;//是否显示新增选择元知识弹出框
  deleteMetaIsVisible;//是否显示删除选择元知识弹出框
  addAttributeIsVisible;//是否显示添加属性弹出框
  saveAttributeIsVisible;//是否显示新增添加属性弹出框
  deleteAttributeIsVisible;//是否显示删除添加属性弹出框

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
  attributeRelationInfo = '';//属性关系展示信息
  relationList: any[] = [{value: 0, label: "小于"}, {value: 1, label: "小于等于"}, {value: 2, label: "等于"},
    {value: 3, label: "大于等于"}, {value: 4, label: "大于"},];
  metaEventCompanyList: any[] = [{value: "subsites", label: "子站"}, {value: "subsystem", label: "子系统"},
    {value: "equipment", label: "设备"}, {value: "attribute", label: "属性"}];
  metaEventRangeList: any[] = [];
  checkCompany = "";
  checkRange = "";
  typeList: any[] = [{value: "2", label: "目标"}, {value: "1", label: "属性"}];
  checktype = "";
  typrInfo = "";

  complexEventForm: FormGroup;
  metaForm: FormGroup;
  attributeForm: FormGroup;

  searchSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '复杂事件名称'
      }
    }
  };
  @ViewChild('st') st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '复杂事件名称', index: 'name'},
    {title: '复杂事件简介', index: 'synopsis'},
    {title: '原子事件范围单位', index: 'metaEventCompany'},
    {title: '原子事件范围', index: 'metaEventRange'},
    {title: '创建时间', index: 'insertTime'},
    {
      title: '操作',
      buttons: [
        // {text: '选择原子事件', click: (item: any) => this.addOrUpdateMeta(item)},
        {text: '编辑属性与目标', click: (item: any) => this.addOrUpdateAttribute(item)},
        {text: '修改', click: (item: any) => this.updateComplexEvent(item)},
        {text: '删除', click: (item: any) => this.deleteComplexEvent(item)},
        {text: '报警', click: (item: any) => this.createNotification("error")},
      ]
    }
  ];
  @ViewChild('metast') metast: STComponent;
  metaColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '原子事件名称', index: 'name'},
    {title: '原子事件简介', index: 'synopsis'},
    {
      title: '操作',
      buttons: [
        {text: '删除', click: (item: any) => this.deleteMeta(item)},
      ]
    }
  ];
  @ViewChild('attributest') attributest: STComponent;
  attributeColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '类型', index: 'type'},
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

  constructor(private notification: NzNotificationService,
              private fb: FormBuilder,
              private modal: ModalHelper,
              private http: _HttpClient) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getList();
    this.complexEventForm = this.fb.group({
      name: [null, [Validators.required]],
      synopsis: [null, [Validators.required]],
      selectCompany: [null, [Validators.required]],
      selectRange: [null, [Validators.required]],
    });
    this.metaForm = this.fb.group({
      selectMeta: [null, [Validators.required]],
    });
    this.attributeForm = this.fb.group({
      selectType: [null, [Validators.required]],
      attributeName: [null, [Validators.required]],
      attributeRelation: [null, [Validators.required]],
      attributeValue: [null, [Validators.required]],
    });

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
            metaEventCompany: data[idx].metaEventCompany,
            metaEventRange: data[idx].metaEventRange,
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
      selectCompany: [null, [Validators.required]],
      selectRange: [null, [Validators.required]],
    });
  }

  //新增复杂事件弹出框
  addComplexEvent(item) {
    this.insertComplexEventIsVisible = true;
  }

  //复杂事件新增或修改  提交到后台
  submitComplexEvent() {
    //检查是否存在
    if (!this.checkComplexEventName(this.complexEventForm.value.name)) {
      this.notification.create("error",
        '提示', this.complexEventForm.value.name + '已存在！'
      );
      return;
    }
    //不存在则新增或修改
    this.http.post('api/complexEvent/infoList/insertComplexEvent', {
      name: this.complexEventForm.value.name,
      synopsis: this.complexEventForm.value.synopsis,
      metaEventCompany: this.complexEventForm.value.selectCompany,
      metaEventRange: this.complexEventForm.value.selectRange,
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
      selectCompany: [item.metaEventCompany, [Validators.required]],
      selectRange: [item.metaEventRange, [Validators.required]],
    });
    this.complexEventUpdateId = item.id;
  }

  //当选择属性范围时，去后台拉取对应的数据
  metaEventCompanyChange(e) {
    this.checkCompany = e;
    this.http.get('api/complexEvent/infoList/getMetaEventRange', {
      type: this.checkCompany
    }).subscribe(data => {
      this.metaEventRangeList = data;
    })
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
    this.getAllMetaList();//获取所有原子事件
  }

  //获取所选原子事件列表
  getMetaList() {
    this.http.get('api/complexEvent/infoList/getMetaList', {
      complexId: this.complexId
    }).subscribe(data => {
      this.metaList = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            id: data[idx].id,
            name: data[idx].name,
            synopsis: data[idx].synopsis,
          }
        })
    })
  }

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
      metaEventId: this.checkMeta,
      complexEventId: this.complexId,
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
      selectType: [null, [Validators.required]],
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
      type: this.attributeForm.value.selectType,
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


  createNotification(type: string): void {
    this.notification.create(
      //error，warning,info
      type,
      '站点报警',
      '<table border="1"><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>',
      {
        nzStyle: {width:'470px',marginLeft: '-100px',color:'red'},
        nzDuration: 0,
      }
    );
  }//nzDuration是毫秒

}
