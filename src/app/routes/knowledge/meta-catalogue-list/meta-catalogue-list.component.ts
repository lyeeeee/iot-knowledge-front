import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc';
import { SFSchema } from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzMessageService, NzModalService, NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-knowledge-meta-catalogue-list',
  templateUrl: './meta-catalogue-list.component.html',
})
export class KnowledgeMetaCatalogueListComponent implements OnInit {

  list: any[] = [];
  name: string = '';//元目录名称
  type = '03';//元目录
  isVisible = false;//是否显示新增弹出框
  deleteIsVisible = false;//是否显示删除确认弹出框
  deleteId = '';//删除id
  departmentName: any[] = [];//存放所有已存在的元目录名称，更新及新增时检查是否已存在
  fieldList: any[] = [];//存放所有领域（级联查询数据）
  // isOkLoading = false;
  values: any[] | null = null;

  form: FormGroup;

  updateId = '';

  searchSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '元目录名称'
      }
    }
  };
  @ViewChild('st') st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id',iif:() => false},
    {title: '元目录名称', index: 'name'},
    {title: '所属领域id', index: 'fieldNameId',iif:() => false},
    {title: '所属领域名称', index: 'fieldName'},
    {title: '所属部门id', index: 'departmentNameId',iif:() => false},
    {title: '所属部门名称', index: 'departmentName'},
    {title: '创建时间', index: 'insertTime'},
    {
      title: '操作',
      buttons: [
        {text: '修改', click: (item: any) => this.update(item)},
        {text: '删除', click: (item: any) => this.delete(item)},
        // {text: '查看详情', click: (item: any) => this.delete(item)},
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  constructor(private http: _HttpClient,
              private modal: ModalHelper,
              private fb: FormBuilder,
              private modalService: NzModalService,
              private notification: NzNotificationService,
              private nzMessageService: NzMessageService) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getList();
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      selectField: [null, [Validators.required]],
    });
    //获取所有领域（级联查询数据）
    this.http.get('api/knowledge/directory/getSelect', {
      type: '01',
    }).subscribe(data => {
      console.log(data)
      this.fieldList = data;
    })
  }

  //调用后台接口获取list数据
  getList() {
    this.departmentName = [];
    this.http.get('api/knowledge/directory', {
      type: this.type,
      name: this.name
    }).subscribe(data => {
      console.log(data)
      this.list = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          this.departmentName.push(data[idx].name);
          return {
            name: data[idx].name,
            insertTime: data[idx].insertTime,
            id: data[idx].id,
            fieldName: data[idx].parent.parent.name,
            fieldNameId: data[idx].parent.parent.id,//元目录爹的爹是领域
            departmentName: data[idx].parent.name,//元目录的爹是部门
            departmentNameId: data[idx].parent.id,
          }
        });
    })
  }

//搜索按钮
  queryList(event) {
    this.name = event.name;
    this.getList();
  }

//新增弹出框
  add() {
    this.isVisible = true;
  }

//点击取消按钮
  handleCancel(): void {
    this.isVisible = false;//新增弹出框
    this.deleteIsVisible = false;//删除确认弹出框
    this.deleteId = '';//删除id设置为空
    // this.metaEventForm.value.name = null;
    this.form = this.fb.group({//表单内容
      name: [null, [Validators.required]],
      selectField: [null, [Validators.required]],
    });
  }

//新增或修改  提交到后台
  submit() {
    //检查是否存在
    if (!this.checkFieldName(this.form.value.name)) {
      this.notification.create("error",
        '提示', this.form.value.name + '已存在！'
      );
      return;
    }
    //不存在则新增或修改
    this.http.post('api/knowledge/directory/insertField', {
      type: this.type,
      name: this.form.value.name,
      id: this.updateId,
      parentId: this.values[1],
    }).subscribe(data => {
      this.isVisible = false;
      this.getList();
      this.updateId = '';
    })

  }

//修改弹出框（使用新增的弹出框，把值赋上即可）
  update(item) {
    this.isVisible = true;
    this.form = this.fb.group({
      name: [item.name, [Validators.required]],
      selectField: [this.values, [Validators.required]],
    });
    this.updateId = item.id;
  }

//删除，弹出删除确认提示框
  delete(item) {
    this.deleteIsVisible = true;
    this.deleteId = item.id;
  }

//确认删除后提交
  deleteSubmit() {
    this.deleteIsVisible = false;
    this.http.delete('api/knowledge/directory/deleteField/' + this.deleteId).subscribe(data => {
      this.getList();//重新获取数据刷新列表
      this.notification.create("success",
        '提示',
        '删除成功！'
      );
      this.deleteId = '';//删除成功后置空
    })
  }

//遍历检查fieldName中是否存在
  checkFieldName(name) {
    for (const fieldName of this.departmentName) {
      if (name === fieldName) {
        return false;
      }
    }
    return true;
  }



}


