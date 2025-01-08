import React, { useEffect, useRef, useState } from "react";
import { ToolTip } from "./Tooltip";
import { AtSign, SendHorizonal, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { EmojiStyle, Theme } from "emoji-picker-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentApi } from "@/api/documentApi";
import { toast } from "sonner";

const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;

export const CommentCreateBox = ({
  documentId,
  style,
  location,
  setEnableCommentBox,
}: {
  documentId: string;
  style?: React.CSSProperties;
  location?: string | null;
  setEnableCommentBox?: (value: boolean) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate: CreateComment } = useMutation({
    mutationFn: CommentApi().CreateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Created Comment Success");
    },
  });

  const [content, setContent] = useState<string>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [enableEmojiPicker, setEnableEmojiPicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const UpCommentHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      content &&
        CreateComment({
          document_id: documentId,
          content: content,
          location: location ? JSON.stringify(location) : "",
        });
      setContent("");
      setEnableEmojiPicker(false);
      setEnableCommentBox && setEnableCommentBox(false);
    }
  };

  const PostCommentHandle = () => {
    content &&
      CreateComment({
        document_id: documentId,
        content: content,
        location: location ? JSON.stringify(location) : "",
      });
    setContent("");
    setEnableEmojiPicker(false);
    setEnableCommentBox && setEnableCommentBox(false);
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
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEnableEmojiPicker(false);
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
      style={style}
      className="flex flex-col p-4 gap-2 mb-5 lg:mb-0 w-full lg:w-[350px] min-h-[100px] h-auto bg-blue-900 text-blue-200"
    >
      <textarea
        ref={textareaRef}
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={UpCommentHandler}
        className={
          "flex h-auto max-h-[300px] w-full rounded-md border-0 border-input bg-transparent resize-none text-sm ring-offset-background overflow-hidden  placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                onEmojiClick={(emoji) => {
                  const textarea = textareaRef.current;
                  textarea!.value += emoji.emoji;
                  setContent(textarea!.value);
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
        </div>
        <ToolTip text="Send (Enter ↵)" className="w-5">
          <SendHorizonal
            className=" hover:cursor-pointer"
            onClick={PostCommentHandle}
          />
        </ToolTip>
      </div>
    </div>
  );
};
