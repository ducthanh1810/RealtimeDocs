import React, { useEffect, useRef, useState } from "react";
import { ToolTip } from "../Tooltip";
import { AtSign, Smile } from "lucide-react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { SendButton } from "../SendButton";

type ReplyEditProps = {
  isResolve: boolean;
  Sendhandle: (value: string) => void;
};

export const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;

export const ReplyEditForm = ({ isResolve, Sendhandle }: ReplyEditProps) => {
  const [content, setContent] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [enableEmojiPicker, setEnableEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SendContentHandle = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      content.length > 0 && Sendhandle(content);
      setIsReply(false);
      setEnableEmojiPicker(false);
      setContent("");
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
        setContent("");
        setEnableEmojiPicker(false);
        setIsReply(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <hr className="hr-solid" />
      <textarea
        placeholder="Reply to thread..."
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={SendContentHandle}
        onFocus={() => setIsReply(true)}
        disabled={isResolve}
        rows={1}
        className={
          "flex h-auto max-h-[300px] w-full px-3 py-2 rounded-sm border-0 border-input bg-transparent resize-none text-sm ring-offset-background overflow-hidden  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
      />
      {isReply && (
        <div className=" flex justify-between">
          <div className=" flex justify-items-center gap-1">
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
          <SendButton Sendhandle={() => Sendhandle(content)} />
        </div>
      )}
    </div>
  );
};
