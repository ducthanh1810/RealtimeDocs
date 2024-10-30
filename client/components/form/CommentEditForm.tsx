import React, { useEffect, useRef, useState } from "react";
import { ToolTip } from "../Tooltip";
import { AtSign, SendHorizonal, Smile } from "lucide-react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";

type CommentEditProps = {
  comment: string;
  isResolve: boolean;
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  Sendhandle: (value: string) => void;
};

export const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;

export const CommentEditForm = ({
  comment,
  setIsEdit,
  Sendhandle,
}: CommentEditProps) => {
  const [content, setContent] = useState(comment);

  const [enableEmojiPicker, setEnableEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SendContentHandle = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      comment && Sendhandle(content);
      setIsEdit(false);
      setEnableEmojiPicker(false);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      };
      textarea.addEventListener("input", adjustHeight);
      return () => textarea.removeEventListener("input", adjustHeight);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setEnableEmojiPicker(false);
        setIsEdit(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <textarea
        ref={textareaRef}
        placeholder="Write a comment..."
        defaultValue={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={SendContentHandle}
        className={
          "flex h-auto max-h-[300px] w-full px-3 py-2 rounded-sm border-0 border-input bg-transparent resize-none text-sm ring-offset-background overflow-hidden  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
      />
      <div className=" flex justify-between">
        <div className=" flex relative justify-items-center gap-1">
          <ToolTip text="Tag" className="w-5">
            <AtSign className=" hover:cursor-pointer" />
          </ToolTip>
          <ToolTip text="Emoji" className="w-5">
            <Smile
              onClick={() => setEnableEmojiPicker((prev: boolean) => !prev)}
              className=" hover:cursor-pointer"
            />
          </ToolTip>
          {enableEmojiPicker && (
            <div className=" absolute top-6 z-10">
              <EmojiPicker
                emojiStyle={EmojiStyle.GOOGLE}
                searchDisabled={true}
                width={250}
                height={350}
                theme={Theme.AUTO}
                style={emojiStyle}
              />
            </div>
          )}
        </div>
        <ToolTip text="Send (Enter ↵)" className="w-5">
          <SendHorizonal
            className=" hover:cursor-pointer"
            onClick={() => Sendhandle(content)}
          />
        </ToolTip>
      </div>
    </>
  );
};
