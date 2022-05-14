import { AuthorProfile, CreatedBy, ID, parseAuthorProfile, parseUnifiedDocument, UnifiedDocument } from "./root_types"

export type CommentContribution = {
  unifiedDocument: UnifiedDocument,
  plainText: string,
  createdBy: CreatedBy,
  id: ID,
}

export type PaperContribution = {
  unifiedDocument: UnifiedDocument,
  title: string,
  slug: string,
  createdBy: CreatedBy,
  id: ID,
}

export type ContentType = {
  name: "paper" | "post" | "hypothesis" | "comment" ,
  id: ID,
}

export type HypothesisContribution = {
  unifiedDocument: UnifiedDocument,
  title: string,
  slug: string,
  createdBy: CreatedBy,
  id: ID,
}

export type PostContribution = {
  unifiedDocument: UnifiedDocument,
  title: string,
  slug: string,
  createdBy: CreatedBy,
  id: ID,
}

export type Contribution = {
  item: PaperContribution | PostContribution | HypothesisContribution | CommentContribution,
  createdDate: Date,
  contentType: ContentType,
}

export const parseCreatedBy = (raw: any): CreatedBy => {
  raw.author_profile.first_name = raw.first_name;
  raw.author_profile.last_name = raw.last_name;

  const mapped = {
    "id": raw.id,
    "firstName": raw.first_name,
    "lastName": raw.last_name,
    "authorProfile": parseAuthorProfile(raw.author_profile)
  }
  
  return mapped;
}

export const parseContentType = (raw: any): ContentType => {
  let contentTypeName;
  if (["thread", "comment", "reply"].includes(raw.name)) {
    contentTypeName = "comment";
  }
  else if (raw.name === "paper") {
    contentTypeName = "paper";
  }
  else if (raw.name === "researchhubpost") {
    contentTypeName = "post";
  }
  else if (raw.name === "hypothesis") {
    contentTypeName = "hypothesis";
  }
  else {
    throw Error("Could not parse object with content_type=" + raw.name)
  }    

  return {
    id: raw.id,
    name: contentTypeName,
  }
}

export const parseContribution = (raw: any): Contribution => {
  let mapped;

  if (["thread", "comment", "reply"].includes(raw.content_type.name)) {
    mapped = {
      "createdDate": raw.created_date,
      "item": parseCommentContribution(raw.item),
      "contentType": parseContentType(raw.content_type),
    }
  }
  else if (raw.content_type.name === "paper") {
    mapped = {
      "createdDate": raw.created_date,
      "item": parsePaperContribution(raw.item),
      "contentType": parseContentType(raw.content_type),
    }
  }
  else if (raw.content_type.name === "researchhubpost") {
    mapped = {
      "createdDate": raw.created_date,
      "item": parsePostContribution(raw.item),
      "contentType": parseContentType(raw.content_type),
    }
  }
  else if (raw.content_type.name === "hypothesis") {
    mapped = {
      "createdDate": raw.created_date,
      "item": parseHypothesisContribution(raw.item),
      "contentType": parseContentType(raw.content_type),
    }
  }
  else {
    throw Error("Could not parse object with content_type=" + raw.content_type.name)
  }

  return mapped;
}

export const parseCommentContribution = (raw: any): CommentContribution => {
  const mapped = {
    "plainText": raw.plain_text,
    "createdBy": parseCreatedBy(raw.created_by),
    "unifiedDocument": parseUnifiedDocument(raw.unified_document),
    "id": raw.id,
  }

  return mapped;
}

export const parsePaperContribution = (raw: any): PaperContribution => {
  
  raw.unified_document.documents = {
    "id": raw.id,
    "title": raw.title,
    "slug": raw.slug,
  }

  const mapped = {
    "id": raw.id,
    "title": raw.title,
    "slug": raw.slug,
    "createdBy": parseCreatedBy(raw.uploaded_by),
    "unifiedDocument": parseUnifiedDocument(raw.unified_document),
  }

  return mapped;
}

export const parseHypothesisContribution = (raw: any): HypothesisContribution => {
  const mapped = {
    "title": raw.title,
    "slug": raw.slug,
    "createdBy": parseCreatedBy(raw.created_by),
    "unifiedDocument": parseUnifiedDocument(raw.unified_document),
    "id": raw.id,
  }

  return mapped;
}

export const parsePostContribution = (raw: any): PostContribution => {
  const mapped = {
    "title": raw.title,
    "slug": raw.slug,
    "createdBy": parseCreatedBy(raw.created_by),
    "unifiedDocument": parseUnifiedDocument(raw.unified_document),
    "id": raw.id,
  }

  return mapped;
}

