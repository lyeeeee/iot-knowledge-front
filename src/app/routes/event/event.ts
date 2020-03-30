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
