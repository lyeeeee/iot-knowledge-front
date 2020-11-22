export class KnowledgeDetail {
  knowledgeName : string;

  knowledgeId : number;

  field : string;

  department : string;

  metaDir : string;

  fieldId : number;

  departmentId : number;

  metaDirId : number;

  knowledgeSynopsis : string;
}

export class KnowledgeFile {

   id: number;

   modelName: string;

   fileName: string;

   filePath: string;

   graphId: string;

   tdbModelName: string;

   knowledgeSynopsis: string;
}

export class KnowledgeKnowledge {
  id: number;

  /***
   * 知识名称
   */
  knowledgeName: string;

  /***
   * 知识uri
   */
  knowledgeUri: string;

  /***
   * 知识文件id
   */
  knowldegeFileId: number;

  /***
   * 知识目录id
   */
  knowledgeDir: number;

  /***
   * 知识记录类型
   */
  type: number;

  /***
   * 知识描述
   */
  knowledgeClassId: number;

  /***
   * 知识对应的目录结点id
   */
  dirNodeId: number;

  /***
   * 所属模型名
   */
  modelName: string;
}
