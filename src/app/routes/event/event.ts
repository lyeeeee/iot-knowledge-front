export class KnowledgeMetaEvent {
  id: number;
  name: string;
  synopsis: string;
  topic: string;
  knowledgeId: number;
  knowledge: string;
}

export class MetaEventAttrRelation {
  id: number;
  knowledgeAttribute: string;
  knowledgeAttributeType: string;
  metaEventId: number;
  topicAttribute: string;
  topicAttributeType: string;
}

export class KnowledgeComplexEvent {
  id: number;
  name: string;
  synopsis: string;
  relation:string;
  targetRelation: string;
}

export class KnowledgeComplexSubEvent {
  id: number;
  subeventRange: string;
  subeventId: number;
  subeventName: string;
  complexEventId: number;
  attrName: string;
  attributeRelation: string;
  relationValue: string;
}

export class KnowledgeComplexTarget {
  id: number;
  subeventId: number;
  subeventName: string;
  complexEventId: number;
  attrName: string;
  attributeRelation: string;
  relationValue: string;
  timeWindow: string;
  lenWindow: number;
}
