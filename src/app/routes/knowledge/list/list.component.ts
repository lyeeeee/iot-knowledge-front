import {Component, OnInit, ViewChild} from '@angular/core';
import {_HttpClient, ModalHelper} from '@delon/theme';
import {STColumn, STComponent} from '@delon/abc';
import {SFSchema} from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzMessageService, NzModalService, NzNotificationService, UploadFile} from "ng-zorro-antd";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-knowledge-list',
  templateUrl: './list.component.html',
})
export class KnowledgeListComponent implements OnInit {
  list: any[] = [];
  name: string = '';//知识名称
  field_name: string = '';//所属领域名称
  department_name: string = '';//所属部门名称
  meta_catalogue_name: string = '';//所属元目录名称
  MetaList: any[] = [];//存放所有元目录

  isVisible = false;//是否显示新增弹出框
  sparqlVisible = false;//是否显示sparql弹出框
  resultTable = [{s: '请输入sparQL查询 ', p: ' ', o: ' '}];//sparql查询结果
  displayResult = false;//sparql查询结果是否显示


  form: FormGroup;
  uploading = false;

  fileList: UploadFile[] = [];
  sparql: SFSchema = {
    properties: {
      remark: {
        type: 'string',
        title: '填写sparQL查询语句',
        ui: {
          widget: 'textarea',
          placeholder: '请输入sparQL语句',
          autosize: {minRows: 6, maxRows: 6}
        }
      }
    }
  };
  searchSchema: SFSchema = {
    properties: {
      name: {
        type: 'string',
        title: '知识名称'
      },
      field_name: {
        type: 'string',
        title: '所属领域'
      },
      department_name: {
        type: 'string',
        title: '所属部门'
      },
      meta_catalogue_name: {
        type: 'string',
        title: '所属元目录'
      },
    }
  };
  @ViewChild('st') st: STComponent;
  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: '知识名称', index: 'name'},
    {title: '所属领域', index: 'field_name'},
    {title: '所属部门', index: 'department_name'},
    {title: '所属元目录', index: 'meta_catalogue_name'},
    {title: '简介', index: 'knowledge_synopsis'},
    {
      title: '操作',
      buttons: [
        {text: 'SparQL查询', click: (item: any) => this.sparqlSelect(item)},
        {text: '知识图谱', type: 'static', click: 'reload'},
      ]
    }
  ];

  constructor(private http: _HttpClient,
              private https: HttpClient,
              private modal: ModalHelper,
              private fb: FormBuilder,
              private modalService: NzModalService,
              private notification: NzNotificationService,
              private msg: NzMessageService,) {
  }

  ngOnInit() {
    //进入页面获取列表数据
    this.getList();
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      graphName: [null, [Validators.required]],
      knowledgeSynopsis: [null, [Validators.required]],
    });
    //获取所有元目录
    this.http.get('api/knowledge/directory/getNameByType', {
      type: '03',
    }).subscribe(data => {
      this.MetaList = data;
      console.log(this.MetaList);
    })
  }

  //调用后台接口获取list数据
  getList() {
    this.http.get('api/knowledge/infoList', {
      name: this.name,
      field_name: this.field_name,
      department_name: this.department_name,
      meta_catalogue_name: this.meta_catalogue_name
    }).subscribe(data => {
      console.log(data);
      this.list = Array(data.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            name: data[idx].name,
            field_name: data[idx].departmentName,
            department_name: data[idx].departmentName,
            meta_catalogue_name: data[idx].metaCatalogueName,
            knowledge_synopsis: data[idx].knowledgeSynopsis,
          }
        })
    })
  }

//搜索按钮
  queryList(event) {
    this.name = event.name;
    this.field_name = event.field_name;
    this.department_name = event.department_name;
    this.meta_catalogue_name = event.meta_catalogue_name;
    // console.log(this.name+'---'+this.field_name+'----'+this.department_name+"----"+this.meta_catalogue_name);
    this.getList();
  }

//TODO 知识导入、删除、知识图谱
  addNewKnowledge(item) {
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
    // alert(item.id);
  }

//新增弹出框
  add() {
    this.isVisible = true;
  }

//点击取消按钮
  handleCancel(): void {
    this.isVisible = false;//新增弹出框
    // this.metaEventForm.value.name = null;
    this.form = this.fb.group({//表单内容
      name: [null, [Validators.required]],
      selectMeta: [null, [Validators.required]],
      graphName: [null, [Validators.required]],
      knowledgeSynopsis: [null, [Validators.required]],
    });

    this.sparqlVisible = false;
    this.resultTable = [{s: '请输入sparQL查询', p: ' ', o: ' '}];
    this.displayResult = false;//sparql查询结果是否显示
  }

  beforeUpload = (file: UploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  handleUpload(): void {
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.fileList.forEach((file: any) => {
      formData.append('file', file);
    });
    this.uploading = true;
    this.http.post('api/knowledge/infoList/insertToGraphdb', formData).subscribe(data => {
      this.isVisible = false;
      this.uploading = false;
      this.getList();
    })
  }

  submit() {
    console.log(this.form.value);
    this.http.post('api/knowledge/infoList/insertToMysql', {
      metaId: this.form.value.selectMeta,
      name: this.form.value.name,
      graphName: 'http://' + this.form.value.graphName,
      knowledgeSynopsis: this.form.value.knowledgeSynopsis,
    }).subscribe(data => {
      if (data.success) {
        this.handleUpload()
      }
      // this.isVisible = false;
      // this.getList();
    })
  }

  sparqlSelect(item) {
    this.sparqlVisible = true;
  }

  submitSparql(e) {
    this.http.get('api/knowledge/infoList/sparqlSelect', {
      sparql: e.remark,
    }).subscribe(data => {
      this.resultTable = [];
      this.resultTable = data;
      this.displayResult = true;
    })
  }

}
