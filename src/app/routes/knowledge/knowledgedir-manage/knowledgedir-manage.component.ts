import { Component, OnInit, } from '@angular/core';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import {NzFormatEmitEvent, NzTreeNode} from 'ng-zorro-antd/core';
import {DirectoryService} from "../../../directory.service";
import {DirectoryDTO, JsonResponse} from "../directory";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-knowledge-knowledgedir-manage',
  templateUrl: './knowledgedir-manage.component.html',
  styleUrls: ['./knowledgedir-manage.component.css'],
})
export class KnowledgeKnowledgedirManageComponent implements OnInit {
  /**
   * 表单是否可见
   * */
  visual:boolean = false;
  /**
   * 对目录的操作，增加同级目录或子目录
   * */
  option: string = null;
  /**
   * 添加目录的表单
   * */
  form: FormGroup
  /**
   * 当前选中结点
   * */
  activedNode: NzTreeNode;
  /**
   * 触发下拉菜单的结点数据值
   * */
  dropDownMenuNodeText: string;
  /**
   * 目录树结点数据
   * */
  nodes = [];

  constructor(
    private nzContextMenuService: NzContextMenuService,
    private directoryService: DirectoryService,
    private notification: NzNotificationService,
    private fb: FormBuilder,) {}

  ngOnInit(): void {
    this.getDirectoryNodeData();
    this.form = this.fb.group({
      name: [null, [Validators.required]],
    });
  }

  openFolder(data: NzTreeNode | Required<NzFormatEmitEvent>): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  activeNode(data: NzFormatEmitEvent): void {
    this.activedNode = data.node!;
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.dropDownMenuNodeText = $event['path'][0].innerText;
    if (this.dropDownMenuNodeText == null ||
        this.activedNode == null ||
      (this.dropDownMenuNodeText != this.activedNode.title)) {
      this.notification.blank(
        'Alert',
        '请先左键选中之后，再进行目录添加/删除操作.'
      );
    } else {
      this.nzContextMenuService.create($event, menu);
    }
    this.dropDownMenuNodeText = null;
  }
  /**
   * 获取所有目录数据
   * */
  private getDirectoryNodeData(): void {
    this.directoryService.getAllDirecotory()
      .subscribe(data => {
        let response: JsonResponse = data;
        let realData: DirectoryDTO = response.data;
        this.nodes = [];
        this.generateDataStructure(realData.child, this.nodes);

      });
  }

  /**
   *结点操作
   * */
  selectDropdown(event: MouseEvent){
    this.option = event.target['innerText'];
    if (this.option == '新建同级目录' || this.option == '新建子级目录') {
      this.visual = true;
    }
  }

  /**
   * 新增结点操作
   * */
  private submit(): void{
    let dirName: string = this.form.value.name;
    let dirNode = {
      id: null,
      nName:dirName,
      attr:"",
      owner: "knowledge_class",
      value: dirName,
      parentId:-1,
    };
    if (this.option == '新建同级目录') {
      if (this.activedNode.getParentNode() == null) {
        dirNode.parentId = 11;
      } else {
        dirNode.parentId = Number.parseInt(this.activedNode.getParentNode().key);
      }
    } else if (this.option == '新建子级目录') {
      dirNode.parentId = Number.parseInt(this.activedNode.key);
    }
    this.directoryService.createNode(dirNode).subscribe(data=> {
      this.getDirectoryNodeData();
    });
    this.handleCancel();
  }
  /**
   * 删除目录
   * */
  private confirmDelete(): void {
    this.directoryService.dropNode(this.activedNode).subscribe(data => {
      this.getDirectoryNodeData();
    });
  }
  /**
   * 点击取消按钮
   * */
  private handleCancel(): void {
    this.visual = false;
    this.option = null;
    this.form.reset();
  }


  private generateDataStructure(data: DirectoryDTO[], nzNodes) {
    if (data == null || data.length == 0){
      return;
    }
    else {
      for (let i = 0;i < data.length; ++i) {
        if (data[i].child == null || data[i].child.length == 0) {
          nzNodes.push({ title: data[i].cur.value, key: data[i].cur.id.toString(), author: 'admin', expanded: false });
        } else {
          nzNodes.push({ title: data[i].cur.value, key: data[i].cur.id.toString(), author: 'admin', children:[], expanded: true});
        }
        this.generateDataStructure(data[i].child, nzNodes[i].children);
      }
    }
  }
}
