+"use client";

import React, { useEffect, useRef } from "react";
import { message as messageAntd } from "antd";
import { NoticeType } from "antd/es/message/interface";

const CustomMessage: React.FC<{ message: string; typeMessage: NoticeType }> = ({
  message,
  typeMessage,
}) => {
  const [messageApi, contextHolder] = messageAntd.useMessage();
  const shownMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (message && shownMessageRef.current !== message) {
      messageApi.open({
        key: message,
        type: typeMessage,
        content: message,
        duration: 7,
        style: { fontSize: 17 },
      });

      shownMessageRef.current = message;
    }
  }, [message, typeMessage, messageApi]);

  return <>{contextHolder}</>;
};

export default CustomMessage;
