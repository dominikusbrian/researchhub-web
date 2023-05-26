import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentAltLines,
  faLayerGroup,
  faStar,
} from "@fortawesome/pro-solid-svg-icons";
import { faComment } from "@fortawesome/pro-regular-svg-icons";
export const getPostTypeStruct = ({ postType, documentType }) => {
  if (
    documentType === "question" ||
    postType === POST_TYPES.ANSWER ||
    documentType === "bounty"
  ) {
    return questionPostTypes.find((t) => t.value === postType);
  } else {
    return postTypes.find((t) => t.value === postType);
  }
};

export enum POST_TYPES {
  DISCUSSION = "DISCUSSION",
  SUMMARY = "SUMMARY",
  REVIEW = "REVIEW",
  ANSWER = "ANSWER",
}

const postTypes = [
  {
    label: "Discuss",
    value: POST_TYPES.DISCUSSION,
    isDefault: true,
    group: "contribute",
    icon: <FontAwesomeIcon icon={faComment}></FontAwesomeIcon>,
    placeholder: "What are your thoughts about this paper?",
  },
  {
    label: "Peer review",
    value: POST_TYPES.REVIEW,
    group: "contribute",
    placeholder: "What are your overall impressions of this paper?",
    icon: <FontAwesomeIcon icon={faStar}></FontAwesomeIcon>,
  },
  {
    label: "Summary",
    value: POST_TYPES.SUMMARY,
    group: "contribute",
    placeholder: "Share a summary of this paper with the community",
    icon: <FontAwesomeIcon icon={faLayerGroup}></FontAwesomeIcon>,
  },
];

export const questionPostTypes = [
  {
    label: "Answer",
    value: POST_TYPES.ANSWER,
    isDefault: true,
    icon: <FontAwesomeIcon icon={faCommentAltLines}></FontAwesomeIcon>,
    placeholder: "Submit your answer to this question.",
  },
  {
    label: "Discuss",
    value: POST_TYPES.DISCUSSION,
    icon: <FontAwesomeIcon icon={faComment}></FontAwesomeIcon>,
    placeholder:
      "Use discussion to ask for clarification or suggest improvement to the question.",
  },
];

export default postTypes;