"use client";

import React, { ReactNode } from "react";

import { Modal } from "antd";

const CustomModalNoContent: React.FC<{
  widthCustomModalNoContent: string;
  minWidthCustomModalNoContent?: string;
  paddingBlockCustomModalNoContent?: number | string;
  openCustomModalState: boolean;
  maskClosableCustomModal: boolean;
  closableCustomModal: boolean;
  contentCustomModal: ReactNode;
  handleCancelCustomModal?: () => void;
}> = ({
  widthCustomModalNoContent,
  minWidthCustomModalNoContent,
  paddingBlockCustomModalNoContent,
  openCustomModalState,
  maskClosableCustomModal,
  closableCustomModal,
  contentCustomModal,
  handleCancelCustomModal,
}) => {
  return (
    <Modal
      className="custom-modal-no-content"
      width={widthCustomModalNoContent}
      style={{
        minWidth: minWidthCustomModalNoContent || "345px",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        paddingBlock: paddingBlockCustomModalNoContent || "31px",
        margin: "0px",
      }}
      open={openCustomModalState}
      onCancel={handleCancelCustomModal}
      maskClosable={maskClosableCustomModal}
      closable={closableCustomModal}
      destroyOnHidden={true}
      footer={null}
      centered
    >
      <div
        className="content-custom-modal-no-content"
        style={{
          display: "flex",
          flexFlow: "column wrap",
          textAlign: "center",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          marginBlock: "7px",
          marginInline: "2px",
        }}
      >
        {contentCustomModal}
      </div>
    </Modal>
  );
};

export default CustomModalNoContent;
