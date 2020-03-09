import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import {NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions} from 'ng-zorro-antd/core';
import {DirectoryService} from "../../../directory.service";
import {DirectoryDTO, JsonResponse} from "../directory";


@Component({
  selector: 'app-knowledge-knowledgedir-manage',
  templateUrl: './knowledgedir-manage.component.html',
  styleUrls: ['./knowledgedir-manage.component.css'],
})
export class KnowledgeKnowledgedirManageComponent implements OnInit {

  // actived node
  activedNode: NzTreeNode;
  nodes = [
    {
      title: 'parent 0',
      key: '100',
      author: 'admin',
      expanded: true,
      children: [
        { title: 'leaf 0-0', key: '1000', author: 'admin', isLeaf: true },
        { title: 'leaf 0-1', key: '1001', author: 'admin', isLeaf: true }
      ]
    },
    {
      title: 'parent 1',
      key: '101',
      author: 'admin',
      children: [
        { title: 'leaf 1-0', key: '1010', author: 'admin', isLeaf: true },
        { title: 'leaf 1-1', key: '1011', author: 'admin', isLeaf: true }
      ]
    }
  ];

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
    this.nzContextMenuService.create($event, menu);
  }

  selectDropdown(): void {
    // do something
  }

  constructor(
    private nzContextMenuService: NzContextMenuService,
    private directoryService: DirectoryService,) {}

  ngOnInit(): void {
    this.getDirectoryNodeData();
  }

  getDirectoryNodeData() {
    this.directoryService.getAllDirecotory()
      .subscribe(data => {
        let response: JsonResponse = data;
        let realData: DirectoryDTO = response.data;
        this.nodes = [];
        this.generateDataStructure(realData.child, this.nodes);

      });
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
