"use client";

import React, { ReactNode } from "react";

import { Button } from "antd";
import { ButtonHTMLType, ButtonShape, ButtonType } from "antd/es/button";
import { SizeType } from "antd/es/config-provider/SizeContext";

const CustomButton: React.FC<{
  titleCustomButton?: string;
  typeCustomButton: ButtonType;
  htmlTypeCustomButton?: ButtonHTMLType;
  idCustomButton?: string | undefined;
  classNameCustomButton?: string;
  sizeCustomButton: SizeType;
  titleTooltipCustomButton?: string | undefined;
  styleCustomButton?: React.CSSProperties | undefined;
  iconCustomButton?: ReactNode;
  iconPositionCustomButton?: "start" | "end";
  shapeCustomButton?: ButtonShape;
  formCustomButton?: string | undefined;
  disabledCustomButton?: boolean;
  onClickCustomButton: () => void;
  onMouseDownCustomButton?: () => void;
}> = ({
  titleCustomButton,
  typeCustomButton,
  htmlTypeCustomButton,
  idCustomButton,
  classNameCustomButton,
  sizeCustomButton,
  titleTooltipCustomButton,
  styleCustomButton,
  iconCustomButton,
  iconPositionCustomButton,
  shapeCustomButton,
  formCustomButton,
  disabledCustomButton,
  onClickCustomButton,
  onMouseDownCustomButton,
}) => {
  return (
    <Button
      id={idCustomButton}
      className={classNameCustomButton}
      title={titleTooltipCustomButton}
      type={typeCustomButton}
      size={sizeCustomButton}
      htmlType={htmlTypeCustomButton || "button"}
      style={styleCustomButton}
      icon={iconCustomButton}
      iconPlacement={iconPositionCustomButton}
      shape={shapeCustomButton}
      form={formCustomButton}
      disabled={disabledCustomButton}
      onClick={onClickCustomButton}
      onMouseDown={onMouseDownCustomButton}
    >
      {titleCustomButton}
    </Button>
  );
};

export default CustomButton;
