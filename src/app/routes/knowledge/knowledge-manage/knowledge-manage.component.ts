import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { STColumn, STComponent } from '@delon/abc/table';
import {
  SFComponent,
  SFSchema,
  SFSchemaEnum,
  SFSelectWidgetSchema, SFUISchema, SFUISchemaItem, SFUISchemaItemRun
} from '@delon/form';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NzCascaderOption, NzMessageService, NzModalService, NzNotificationService, UploadFile} from "ng-zorro-antd";
import {HttpClient} from "@angular/common/http";
import {DirectoryDTO, DirectoryNode} from "../directory";
import {DirectoryService} from "../../../directory.service";
import {KnowledgeDetail} from "../knowledge";




@Component({
  selector: 'app-knowledge-knowledge-manage',
  templateUrl: './knowledge-manage.component.html',
  styleUrls: ['./knowledge-manage.component.css'],
})
export class KnowledgeKnowledgeManageComponent implements OnInit {

  @ViewChild('sfKnowledge', { static: true }) sfKnowledge: SFComponent;
  @ViewChild('sfField', { static: true }) sfField: SFComponent;
  @ViewChild('sfDeparment', { static: true }) sfDeparment: SFComponent;
  @ViewChild('sfMetaDir', { static: true }) sfMetaDir: SFComponent;

  @ViewChild('st', { static: true }) st: STComponent;

  /**
   * 存储目录信息
   * */
  allDirectoryInfo: DirectoryDTO;
  /**
   * 是否显示导入知识弹出框
   * */
  uploadVisible = false;//是否显示新增弹出框
  list: any[] = [];


  name: string = '';//知识名称
  field_name: number = null;//所属领域名称
  department_name: number = null;//所属部门名称
  meta_catalogue_name: number = null;//所属元目录名称


  MetaList: any[] = [];//存放所有元目录


  sparqlVisible = false;//是否显示sparql弹出框
  resultTable = [{s: '请输入sparQL查询 ', p: ' ', o: ' '}];//sparql查询结果
  displayResult = false;//sparql查询结果是否显示

  form: FormGroup;
  uploading = false;


  fieldDir: SFSchemaEnum[] = [];
  departmentDir: SFSchemaEnum[] = [];
  metaDir: SFSchemaEnum[] = [];

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

  /**
   * 搜索栏data
   * */
  knowledgeSchema: SFSchema = {
    ui: {
      width: 200,
    },
    properties: {
      name: {
        type: 'string',
        title: '知识名称',
      },
    },
  };
  fieldSchema: SFSchema = {
    ui: {
      width: 200,
    },
    properties: {
      field: {
        type: 'string',
        title: '领域',
        enum: [],
        default: null,
        ui: {
          widget: 'select',
        } as SFSelectWidgetSchema,
      },
    },
  };
  departmentSchema: SFSchema = {
    ui: {
      width: 200,
    },
    properties: {
      department: {
        type: 'string',
        title: '部门',
        enum: [
        ],
        default: null,
        ui: {
          widget: 'select',
        } as SFSelectWidgetSchema,
      },
    },
  };
  metaDirSchema: SFSchema = {
    ui: {
      width: 250,
      expandTrigger:'hover',
    },
    properties: {
      static: {
        type: 'number',
        title: '元目录',
        enum: [],
        ui: 'cascader',
      },
    },
  };


  /**
   * 表单级联选择
   * */
  options = [];
  nzOptions: NzCascaderOption[] = this.options;
  //values: string[] | null = null;

  onChanges(values: string[]): void {
    //console.log(values, this.values);
  }

  columns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: '知识名称', index: 'knowledgeName'},
    {title: '所属领域', index: 'field'},
    {title: '所属部门', index: 'department'},
    {title: '所属元目录', index: 'metaDir'},
    {title: '简介', index: 'knowledgeSynopsis'},
    // {
    //   title: '操作',
    //   buttons: [
    //     {text: 'SparQL查询', click: (item: any) => this.sparqlSelect(item)},
    //     // {text: '知识图谱', type: 'static', click: 'reload'},
    //   ]
    // }
  ];


  modelManageVisiable: boolean = false;
  modelManagelist = [];
  /**
   * 模型展示框
   * */
  @ViewChild('st', { static: true }) stModelManage: STComponent;
  modelManageColumns: STColumn[] = [
    {title: '序号', type: 'no'},
    {title: 'id', index: 'id', iif: () => false},
    {title: '模型名称', index: 'model_name'},
    {title: '模型简介', index: 'knowledge_synopsis'},
    {title: '模型文件名称', index: 'file_name'},
    {title: '模型图id', index: 'graph_id'},
    {
      title: '操作',
      buttons: [
        {text: '删除模型', click: (item: any) => this.deleteModel(item)},
      ]
    }
  ];


  constructor(private http: _HttpClient,
              private https: HttpClient,
              private modal: ModalHelper,
              private fb: FormBuilder,
              private modalService: NzModalService,
              private notification: NzNotificationService,
              private msg: NzMessageService,
              private directoryService: DirectoryService,) {
  }

  ngOnInit() {
    this.sfKnowledge.button = "none";
    this.sfDeparment.button = "none";
    this.sfField.button = "none";
    this.getList(null, null, null, null,);
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
    })
    this.getAllDirecotory();
  }

  //调用后台接口获取list数据
  private getList(knowledgeName: string, field: number, department: number, metaDir: number) {
    this.directoryService.getAllKnowledge(knowledgeName, field, department, metaDir).subscribe(data => {
      let ret = data.data;
      this.list = Array(ret.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            knowledgeName: ret[idx].knowledgeName,
            field: ret[idx].field,
            department: ret[idx].department,
            metaDir: ret[idx].metaDir,
            knowledgeSynopsis: ret[idx].knowledgeSynopsis,
          }
        })
    });
  }

  /**
   * 搜索按钮
   * */
  private queryList(event) {
    this.getList(this.name, this.field_name, this.department_name, this.meta_catalogue_name);
  }

//TODO 知识导入、删除、知识图谱
  addNewKnowledge() {
    this.uploadVisible = true;
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
    // alert(item.id);
  }

  //新增弹出框
  add() {
    this.uploadVisible = true;
  }

  //点击取消按钮
  handleCancel(): void {
    this.uploadVisible = false;//新增弹出框
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
      this.uploadVisible = false;
      this.uploading = false;
      this.getList(null, null, null, null);
    })
  }

  submit() {
    const formData = new FormData();
    formData.append('metaId', this.form.value.selectMeta);
    formData.append('name', this.form.value.name);
    formData.append('graphName', this.form.value.graphName);
    formData.append('knowledgeSynopsis', this.form.value.knowledgeSynopsis);
    this.fileList.forEach((file: any) => {
      formData.append('file', file);
    });

    // this.http.post('api/knowledge/upload', {
    //   metaId: this.form.value.selectMeta,
    //   name: this.form.value.name,
    //   graphName: 'http://' + this.form.value.graphName,
    //   knowledgeSynopsis: this.form.value.knowledgeSynopsis,
    // }).subscribe(data => {
    //   if (data.msg) {
    //     console.log("success");
    //     this.handleUpload()
    //   }
    //   this.uploadVisible = false;
    //   this.getList();
    // })
    this.http.post('api/knowledge/upload', formData).subscribe(data => {
      if (data.msg) {
        console.log("success");
        //this.handleUpload()
      }
      this.uploadVisible = false;
      this.getList(null, null, null, null);
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

  /**
   * 获取所有的领域部门和元目录信息
   * */
  private getAllDirecotory(): void{
    this.directoryService.getAllDirecotory()
      .subscribe(data => {
        this.allDirectoryInfo = data['data'];
        this.fillSearchItems(this.allDirectoryInfo);
        this.options = [];
        this.handleOptions(this.allDirectoryInfo.child, this.options);
        this.nzOptions = this.options;
      });
  }

  /**
   * 填充搜索栏
   * */
  private fillSearchItems(dir: DirectoryDTO): void {
    let tmpDir:DirectoryDTO = dir;
    let queue:DirectoryDTO[] = [];
    let cnt:number = 0;
    let subDir: DirectoryDTO[] = [];
    queue.push(tmpDir);
    while (queue.length != 0) {
      if (cnt == 3) break;
      let size = queue.length;
      while (size-- > 0) {
        let dto: DirectoryDTO = queue.shift();
        if (dto.child != null && dto.child.length != 0) {
          dto.child.forEach(value => queue.push(value));
        }
        if (cnt == 0) continue;
        else if (cnt == 1) {
          this.fieldDir.push({label: dto.cur.value, value: dto.cur.id});
        } else if (cnt == 2) {
          this.departmentDir.push({label: dto.cur.value, value: dto.cur.id});
          if (dto.child != null && dto.child.length != 0) {
            dto.child.forEach(value => subDir.push(value));
          }
        }
      }
      cnt++;
    }
    this.fieldSchema.properties.field.enum = this.fieldDir;
    this.departmentSchema.properties.department.enum = this.departmentDir;
    // 处理元目录
    this.handleMetaDir(subDir, this.metaDir);
    this.sfField.refreshSchema();
    this.sfDeparment.refreshSchema();
    this.sfMetaDir.refreshSchema();
  }

  /**
   * 填充表单级联目录
   * */
  private handleOptions(dir: DirectoryDTO[], op:NzCascaderOption[]) : void{
    if (dir == null || dir.length == 0){
      return;
    }
    else {
      for (let i = 0;i < dir.length; ++i) {
        if (dir[i].child == null || dir[i].child.length == 0 || dir[i].cur.nName == '部门') {
          op.push({ value: dir[i].cur.id,label: dir[i].cur.value, isLeaf: true});
        } else {
          op.push({value: dir[i].cur.id, label: dir[i].cur.value, children:[]});
          this.handleOptions(dir[i].child, op[i].children);
        }
      }
    }
  }

  /**
   * 填充搜索栏，元目录
   * */
  private handleMetaDir(subDir:DirectoryDTO[], metaDir: SFSchemaEnum[]): void {
    this.handleMetaDirHelper(subDir, metaDir);
    this.metaDirSchema.properties.static.enum = this.metaDir;
  }

  private handleMetaDirHelper(cur: DirectoryDTO[], metaDir): void {
    if (cur == null || cur.length == 0){
      return;
    }
    else {
      for (let i = 0;i < cur.length; ++i) {
        if (cur[i].child == null || cur[i].child.length == 0) {
          metaDir.push({label: cur[i].cur.value, value: cur[i].cur.id, isLeaf: true});
        } else {
          metaDir.push({label: cur[i].cur.value, value: cur[i].cur.id, children:[], isLeaf: true});
        }
        this.handleMetaDirHelper(cur[i].child, metaDir[i].children);
      }
    }
  }

  knowledgeSchemaFormChange(event) {
    this.name = event.name;
  }

  fieldSchemaFormChange(event) {
    this.field_name = event.field;
  }

  departmentSchemaFormChange(event) {
    this.department_name  = event.department;
  }

  metaDirSchemaFormChange(event) {
    this.meta_catalogue_name = event.static[event.static.length-1];
  }
  /**
   * 展示模型窗口显示
   * */
  private modelManage(): void {
    this.modelManageVisiable = true;
    this.getAllModel();
  }

  private getAllModel(): void {
    this.directoryService.getAllModel().subscribe(data => {
      let files = data.data;
      this.modelManagelist = Array(files.length)
        .fill({}).map((item: any, idx: number) => {
          return {
            id: files[idx].id,
            model_name: files[idx].modelName,
            knowledge_synopsis: files[idx].knowledgeSynopsis,
            file_name: files[idx].fileName,
            graph_id: 'http://' + files[idx].graphId,
          }
        })
    });
  }
  /**
   * 关闭展示模型窗口
   * */
  private handlModelManageCancel(): void {
    this.modelManageVisiable = false;
  }
  /**
   * 删除模型
   * */
  private deleteModel(item: any) {
    let id = item.id;
    this.directoryService.deleteModel(id).subscribe(data => {
      this.getAllModel();
    });
  }
}
