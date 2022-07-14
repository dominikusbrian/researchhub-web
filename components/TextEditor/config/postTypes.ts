import icons from "~/config/themes/icons";

export enum POST_TYPES {
  DISCUSSION = "DISCUSSION",
  SUMMARY = "SUMMARY",
  REVIEW = "REVIEW",
  ANSWER = "ANSWER",
  SUMMARY_REQUEST = "SUMMARY_REQUEST",
  REVIEW_REQUEST = "REVIEW_REQUEST",
  OTHER_REQUEST = "OTHER_REQUEST",
} 

const postTypes = [{
  label: "Discuss",
  value: POST_TYPES.DISCUSSION,
  isDefault: true,
  group: "contribute",
  icon: icons.commentRegular,
  placeholder: "What are your thoughts about this paper?",
},{
  label: "Peer review",
  value: POST_TYPES.REVIEW,  
  group: "contribute",
  placeholder: "What are your overall impressions of this paper?",
  icon: icons.starFilled,
},{
  label: "Summary",
  value: POST_TYPES.SUMMARY,
  group: "contribute",
  placeholder: "Contribute a summary of this paper to the community",
  icon: icons.layerGroup,
},{
  label: "Peer review",
  value: POST_TYPES.REVIEW_REQUEST,
  placeholder: "Add details about your peer review request. What are you looking for exactly?",
  group: "request",
  icon: icons.starFilled,
}, {
  label: "Summary",
  value: POST_TYPES.SUMMARY_REQUEST,  
  placeholder: "Add details about your summary request. What are you looking for exactly?",
  group: "request",
  icon: icons.layerGroup,
}];

export const questionPostTypes = [{
  label: "Answer",
  value: POST_TYPES.ANSWER,
  isDefault: true,
  icon: icons.commentAltLineSolid,
  placeholder: "Submit your answer to this question.",
},{
  label: "Discuss",
  value: POST_TYPES.DISCUSSION,
  icon: icons.commentRegular,
  placeholder: "Use discussion to ask for clarification or suggest improvement to the question.",
}]

export default postTypes;
