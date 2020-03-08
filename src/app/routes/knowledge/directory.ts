export class JsonResponse {
  code: number;
  message: string;
  data: any;
}

export class DirectoryDTO {
  cur: DirectoryNode;
  child: DirectoryDTO[];
}

export class DirectoryNode {
  id: number;
  nName: string;
  parentId: number;
  attr: string;
  owner: string;
  value: string;
}
