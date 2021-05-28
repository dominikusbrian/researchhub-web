import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { StyleSheet, css } from "aphrodite";
import ReactPlaceholder from "react-placeholder/lib";
import ColumnContainer from "./ColumnContainer";
import PreviewPlaceholder from "~/components/Placeholders/PreviewPlaceholder";
import { ModalActions } from "~/redux/modals";
import { fetchPaperFigures } from "~/config/fetch";
import { absoluteUrl } from "../../../config/utils";

const PaperPreview = ({
  paper,
  paperId,
  previewStyles,
  columnOverrideStyles,
}) => {
  const dispatch = useDispatch();
  const [figureUrls, setFigureUrls] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchFigures();
  }, [paperId]);

  const fetchFigures = () => {
    if (paperId) {
      setFetching(true);
      return fetchPaperFigures(paperId).then((res) => {
        const { data } = res;
        setFigureUrls(data.map((preview) => preview.file));
        setFetching(false);
      });
    }
  };

  const openPaperPDFModal = (e) => {
    e && e.stopPropagation();
    const { file, pdf_url } = paper;

    /**
     * We only open the pdf modal if we have a valid url
     */
    if (file || pdf_url) {
      return dispatch(ModalActions.openPaperPDFModal(true));
    }
  };

  return (
    <ColumnContainer
      overrideStyles={[
        !fetching && !figureUrls.length ? styles.hidden : styles.container,
        columnOverrideStyles,
        fetching && styles.fetching,
      ]}
      onClick={openPaperPDFModal}
    >
      <ReactPlaceholder
        ready={!fetching}
        showLoadingAnimation
        customPlaceholder={
          <PreviewPlaceholder previewStyles={previewStyles} color="#efefef" />
        }
      >
        <img
          src={figureUrls[0]}
          className={css(styles.preview, previewStyles)}
          property="image"
        />
      </ReactPlaceholder>
    </ColumnContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    cursor: "pointer",
    width: "unset",
    marginLeft: "auto",

    display: "flex",
    flex: "1 1 0px",
    overflowY: "hidden",
    overflowX: "hidden",
    justifyContent: "center",

    "@media only screen and (max-width: 767px)": {
      display: "none",
    },
  },
  fetching: {
    border: "none",
  },
  hidden: {
    display: "none",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  buttonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    zIndex: 4,
  },
});

export default PaperPreview;
