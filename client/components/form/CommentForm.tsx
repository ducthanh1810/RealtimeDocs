import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentApi, ReplyApi } from "@/api/documentApi";
import { toast } from "sonner";
import { CommentType } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Reply } from "../Reply";
import { ReplyEditForm } from "./ReplyEditForm";
import { CommentEditForm } from "./CommentEditForm";
import { CommentBoxHeader } from "../CommentBoxHeader";

type ReactionType = {
  icon: string;
  count: number;
};

export const CommentForm = ({
  comment,
  style,
  deleteCm,
}: {
  comment: CommentType;
  style?: React.CSSProperties;
  deleteCm: (id: number) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate: CreateReply } = useMutation({
    mutationFn: ReplyApi().CreateReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`comments`] });
      queryClient.invalidateQueries({ queryKey: [`replies-${comment.id}`] });
      toast.success("Created reply Success");
    },
  });

  const { mutate: UpdateComment } = useMutation({
    mutationFn: CommentApi().UpdateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Update Comment Success");
    },
  });
  const { mutate: UpdateCommentReaction } = useMutation({
    mutationFn: CommentApi().UpdateCommentReaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
  const { mutate: UpdateCommentResolve } = useMutation({
    mutationFn: CommentApi().UpdateCommentResolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      setIsResolve((prev) => !prev);
    },
  });
  const { mutate: DeleteComment } = useMutation({
    mutationFn: CommentApi().DeleteComment,
    onSuccess: () => {
      deleteCm(comment.id);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Delete Comment Success");
    },
  });

  const [content, setContent] = useState<string>(comment.content);
  const [reactions, setReactions] = useState<ReactionType[]>(
    JSON.parse(comment.reaction).reactions || []
  );
  const [isEditReaction, setIsEditReaction] = useState(false);
  const [hiddenActions, setHiddenActions] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [isReply, setIsReply] = useState(false);

  const [enableEmojiPicker, setEnableEmojiPicker] = useState(false);
  const [isResolve, setIsResolve] = useState(comment.resolve);
  const [MoreReply, setMoreReply] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const DeleteHandle = () => {
    DeleteComment({ comment_id: comment.id });
  };

  const PostCommentHandle = (value: string) => {
    value &&
      UpdateComment({
        comment_id: comment.id,
        content: value,
        location: comment ? comment.location : "{}",
      });
    setIsEdit(false);
    setIsReply(false);
    setEnableEmojiPicker(false);
  };

  const CreateReplyHandle = (value: string) => {
    value &&
      CreateReply({
        content: value,
        comment_id: comment.id,
      });
  };

  const ResolveHandle = () => {
    UpdateCommentResolve({ comment_id: comment.id });
  };

  const EmojiHandle = (emoji: string) => {
    let isHaveEmoji = true;
    if (enableEmojiPicker) {
      const textarea = textareaRef.current;
      textarea!.value += emoji;
      setContent(textarea!.value);
    }
    reactions.length > 0 &&
      reactions.map((reaction: ReactionType) => {
        if (reaction.icon == emoji) {
          reaction.count++;
          setReactions([...reactions]);
          isHaveEmoji = false;
        }
      });
    isHaveEmoji && setReactions([...reactions, { icon: emoji, count: 1 }]);
    setIsEditReaction(true);
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
    setIsEditReaction(true);
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
        setIsReply(false);
        setTimeout(() => setHiddenActions(true), 200);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setContent(comment.content);
  }, [comment]);

  useEffect(() => {
    isEditReaction &&
      reactions.length > 0 &&
      UpdateCommentReaction({
        comment_id: comment.id,
        reaction: JSON.stringify({
          reactions: reactions,
        }),
      });
    setIsEditReaction(false);
  }, [isEditReaction]);

  return (
    <div className=" flex flex-col gap-2">
      <div
        ref={containerRef}
        onMouseOver={() => setHiddenActions(false)}
        style={style}
        className={cn(
          "flex flex-col relative p-4 gap-3 mb-5 lg:mb-0 w-full lg:w-[350px] min-h-[100px] h-auto bg-blue-900 text-blue-200",
          isResolve && "opacity-60"
        )}
      >
        {/* -------------------------- Header comment box ------------------------------- */}
        <CommentBoxHeader
          comment={comment}
          hiddenActions={hiddenActions}
          isResolve={isResolve}
          ResolveHandle={ResolveHandle}
          setIsEdit={setIsEdit}
          DeleteHandle={DeleteHandle}
          EmojiHandle={EmojiHandle}
        />
        {/* ----------------- Content comment --------------------- */}
        {isEdit ? (
          <CommentEditForm
            comment={comment.content}
            isResolve={comment.resolve}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            Sendhandle={PostCommentHandle}
          />
        ) : (
          <div className="flex flex-col py-2 gap-2 h-auto max-h-[150px] w-full rounded-sm border-0 border-input bg-[#09111f]">
            <p className="max-h-[100px] p-2 break-words text-ellipsis overflow-auto scrollbar">
              {content}
            </p>
            <div className=" flex gap-1 px-2">
              {reactions &&
                reactions.map((reaction, idex) => (
                  <p
                    key={idex}
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
        {/* ----------------- Reply comment --------------------- */}
        <ReplyEditForm isResolve={isResolve} Sendhandle={CreateReplyHandle} />
        {!isReply && comment.replies[0] && (
          <Button
            variant={"default"}
            size={"icon"}
            className=" absolute -bottom-2 right-2 h-5 w-5 bg-blue-900 rounded-xl"
            onClick={() => setMoreReply((prev) => !prev)}
          >
            {MoreReply ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </div>
      {MoreReply && <Reply comment_id={comment.id} resolve={comment.resolve} />}
    </div>
  );
};
