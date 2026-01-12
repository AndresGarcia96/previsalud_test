"use client";

import React, { useRef } from "react";

import { Statistic } from "antd";
import type { StatisticTimerProps } from "antd";

const { Timer } = Statistic;

interface CountdownTimerProps {
  onFinishHandler: () => void;
  showCountdown: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  onFinishHandler,
  showCountdown,
}) => {
  const countdownTime = Number(process.env.NEXT_PUBLIC_COUNTDOWN_TIMER);

  const deadlineTime = useRef(Date.now() + countdownTime * 1000);

  const zeroTime = Date.now();

  const onFinish: StatisticTimerProps["onFinish"] = () => {
    onFinishHandler();
  };

  return (
    <Timer
      type="countdown"
      value={showCountdown ? deadlineTime.current : zeroTime}
      onFinish={onFinish}
      format="mm:ss"
      styles={{
        content: {
          fontSize: 14,
          color: showCountdown ? "#960202" : "#137A2B",
        },
      }}
    />
  );
};

export default CountdownTimer;
