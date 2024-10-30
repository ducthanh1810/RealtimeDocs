import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReplyApi } from "@/api/documentApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CommentEditForm } from "./CommentEditForm";
import { CommentBoxHeader } from "../CommentBoxHeader";
import { ReplyType } from "@/types";

type ReactionType = {
  icon: string;
  count: number;
};

export const ReplyForm = ({
  reply,
  resolve,
  style,
  deleteCm,
}: {
  reply: ReplyType;
  resolve: boolean;
  style?: React.CSSProperties;
  deleteCm: (id: number) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate: UpdateReply } = useMutation({
    mutationFn: ReplyApi().UpdateReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      toast.success("Update Reply Success");
    },
  });
  const { mutate: UpdateReplyReaction } = useMutation({
    mutationFn: ReplyApi().UpdateReplyReaction,
  });
  const { mutate: DeleteReply } = useMutation({
    mutationFn: ReplyApi().DeleteReply,
    onSuccess: () => {
      deleteCm(reply.id);
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      toast.success("Delete Reply Success");
    },
  });

  const [content, setContent] = useState<string>(reply.content);
  const [reactions, setReactions] = useState<ReactionType[]>(
    JSON.parse(reply.reaction).reactions
  );
  const [hiddenActions, setHiddenActions] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  const [enableEmojiPicker, setEnableEmojiPicker] = useState(false);
  const [enableReaction, setEnableReaction] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const DeleteHandle = () => {
    DeleteReply({ reply_id: reply.id });
  };

  const PostReplyHandle = () => {
    reply &&
      UpdateReply({
        reply_id: reply.id,
        content: content,
      });
    setIsEdit(false);
    setEnableEmojiPicker(false);
  };

  const EmojiHandle = (emoji: string) => {
    let isHaveEmoji = true;
    if (enableEmojiPicker) {
      const textarea = textareaRef.current;
      textarea!.value += emoji;
      setContent(textarea!.value);
    }
    enableReaction && reactions.length > 0
      ? reactions.map((reaction: ReactionType) => {
          if (reaction.icon == emoji) {
            reaction.count++;
            setReactions([...reactions]);
            isHaveEmoji = false;
          }
        })
      : setReactions([...reactions, { icon: emoji, count: 1 }]);
    isHaveEmoji && setReactions([...reactions, { icon: emoji, count: 1 }]);
  };

  const RemoveEmoji = (emoji: string) => {
    reactions.map((reaction: ReactionType) => {
      if (reaction.icon == emoji) {
        reaction.count--;
        reaction.count == 0
          ? setReactions(reactions.filter((r) => r !== reaction))
          : setReactions([...reactions]);
      }
    });
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
        setEnableReaction(false);
        setIsEdit(false);
        setTimeout(() => setHiddenActions(true), 200);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setContent(reply.content);
  }, [reply]);

  useEffect(() => {
    const data = {
      reactions: reactions,
    };
    UpdateReplyReaction({
      reply_id: reply.id,
      reaction: JSON.stringify(data),
    });
  }, [reactions]);

  return (
    <div className=" flex flex-col gap-2">
      <div
        ref={containerRef}
        onMouseOver={() => setHiddenActions(false)}
        style={style}
        className={cn(
          "flex flex-col relative p-4 gap-3 mb-5 ml-6 lg:mb-0 w-full lg:w-[350px] min-h-[100px] h-auto bg-blue-900 text-blue-200",
          resolve && "opacity-60"
        )}
      >
        {/* -------------------------- Header reply box ------------------------------- */}
        <CommentBoxHeader
          comment={reply}
          hiddenActions={hiddenActions}
          isResolve={resolve}
          setIsEdit={setIsEdit}
          DeleteHandle={DeleteHandle}
          EmojiHandle={EmojiHandle}
        />
        {/* ----------------- Content reply --------------------- */}
        {isEdit ? (
          <CommentEditForm
            comment={reply.content}
            isResolve={resolve}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            Sendhandle={PostReplyHandle}
          />
        ) : (
          <div className="flex flex-col py-2 gap-2 h-auto max-h-[150px] w-full rounded-sm border-0 border-input bg-[#09111f]">
            <p className="max-h-[100px] p-2 break-words text-ellipsis overflow-auto scrollbar">
              {content}
            </p>
            <div className=" flex gap-1 px-2">
              {reactions &&
                reactions.map((reaction: ReactionType) => (
                  <p
                    key={reaction.icon}
                    onClick={() => RemoveEmoji(reaction.icon)}
                    className="flex w-10 h-7 text-sm bg-blue-800/50 justify-center items-center rounded-2xl border-2 border-blue-800 hover:cursor-pointer"
                  >
                    {reaction.icon}
                    {reaction.count}
                  </p>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
