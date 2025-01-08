import { CommentApi } from "@/api/documentApi";
import { ReplyType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ReplyForm } from "./form/ReplyForm";

export const Reply = ({
  comment_id,
  resolve,
}: {
  comment_id: number;
  resolve: boolean;
}) => {
  const { data, isPending } = useQuery({
    queryKey: [`replies-${comment_id}`],
    queryFn: () => CommentApi().GetReplies(comment_id),
  });

  const [replies, setReplies] = useState<ReplyType[]>();

  useEffect(() => {
    data?.data && setReplies(data?.data);
  }, [data?.data]);

  const DeleteCommentHandle = (idToDelete: number) => {
    const updatedItems = replies
      ? replies.filter((item) => item.id !== idToDelete)
      : null;
    updatedItems && setReplies(updatedItems);
  };

  return (
    <div>
      {isPending ? (
        <p>Loading...</p>
      ) : (
        <div>
          {replies?.map((reply) => (
            <ReplyForm
              key={reply.id}
              reply={reply}
              resolve={resolve}
              comment_id={comment_id}
              deleteCm={DeleteCommentHandle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
