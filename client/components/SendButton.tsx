import React from "react";
import { ToolTip } from "./Tooltip";
import { SendHorizonal } from "lucide-react";

export const SendButton = ({ Sendhandle }: { Sendhandle: () => void }) => {
  return (
    <ToolTip text="Send (Enter ↵)" className="w-5">
      <SendHorizonal className=" hover:cursor-pointer" onClick={Sendhandle} />
    </ToolTip>
  );
};
