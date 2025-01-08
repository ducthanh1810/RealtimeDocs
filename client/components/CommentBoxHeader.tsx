import React, { useContext, useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn, dateConverter } from "@/lib/utils";
import { ToolTip } from "./Tooltip";
import { CircleCheck, SmilePlus } from "lucide-react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import AuthContext from "@/context/AuthContext";
import { MoreActions } from "./ButtonMoreActions";
import { CommentType, ReplyType } from "@/types";

type CommentHeaderProps = {
  comment: ReplyType | CommentType;
  hiddenActions: boolean;
  isResolve?: boolean;
  ResolveHandle?: () => void;
  setIsEdit: (value: boolean) => void;
  DeleteHandle: () => void;
  EmojiHandle: (emoji: string) => void;
};

export const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;

export const CommentBoxHeader = ({
  comment,
  hiddenActions,
  isResolve,
  ResolveHandle,
  setIsEdit,
  DeleteHandle,
  EmojiHandle,
}: CommentHeaderProps) => {
  const { user } = useContext(AuthContext);
  const [enableReaction, setEnableReaction] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEnableReaction(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className=" flex flex-row gap-2 justify-between items-center"
    >
      <div className=" flex gap-2">
        {comment.user && (
          <Avatar className="w-7 h-7">
            <AvatarImage
              src={process.env.NEXT_PUBLIC_BASE_API + "/" + comment.user.image}
            />
            <AvatarFallback className=" uppercase text-xs">
              {comment.user.full_name ? comment.user.full_name : "user"}
            </AvatarFallback>
          </Avatar>
        )}
        <p>{comment.user.full_name}</p>
        <p className=" font-light text-sm">
          {dateConverter(comment.updated_at)}
        </p>
      </div>
      <div
        className={cn(
          " relative",
          hiddenActions ? "hidden" : "flex relative gap-2 justify-items-center"
        )}
      >
        {isResolve !== undefined && (
          <ToolTip text="Resolve" className="w-5">
            <CircleCheck
              onClick={ResolveHandle}
              className=" hover:cursor-pointer"
            />
          </ToolTip>
        )}
        {!isResolve && (
          <>
            <ToolTip text="Add reaction" className="w-5">
              <SmilePlus
                className=" hover:cursor-pointer"
                onClick={() => setEnableReaction((prev) => !prev)}
              />
            </ToolTip>
            {enableReaction && !isResolve && (
              <div className=" absolute top-6 right-1 z-10">
                <EmojiPicker
                  onEmojiClick={(emoji: any) => {
                    EmojiHandle(emoji.emoji);
                  }}
                  emojiStyle={EmojiStyle.GOOGLE}
                  searchDisabled={true}
                  width={250}
                  height={350}
                  theme={Theme.AUTO}
                  style={emojiStyle}
                />
              </div>
            )}
            {user && user.user == comment.user_id && (
              <ToolTip text="More" className="w-5">
                <MoreActions
                  isOpen={!hiddenActions}
                  setIsEdit={setIsEdit}
                  DeleteComment={DeleteHandle}
                />
              </ToolTip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
