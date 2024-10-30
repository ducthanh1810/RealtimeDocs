import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommentApi } from "@/api/documentApi";
import { CommentType } from "@/types";
import { CommentForm } from "./form/CommentForm";

export const Comment = ({
  documentId,
}: {
  documentId: any;
  style?: React.CSSProperties;
}) => {
  const { data, isPending } = useQuery({
    queryKey: ["comments"],
    queryFn: () => CommentApi().GetList(documentId),
  });

  const [comments, setComments] = useState<CommentType[]>();

  const DeleteCommentHandle = (idToDelete: any) => {
    const updatedItems = comments
      ? comments.filter((item) => item.id !== idToDelete)
      : null;
    updatedItems && setComments(updatedItems);
  };

  useEffect(() => {
    if (data?.data) setComments(data.data);
  }, [data?.data]);

  return (
    <>
      {isPending ? (
        <div className="flex flex-col relative p-4 gap-2 mb-5 lg:mb-0 w-full lg:w-[350px] min-h-[100px] h-auto bg-blue-900 text-blue-200">
          <p className=" absolute translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%]">
            Loading...
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {comments?.map((comment: CommentType) => (
            <CommentForm
              key={comment.id}
              comment={comment}
              deleteCm={DeleteCommentHandle}
            />
          ))}
        </div>
      )}
    </>
  );
};
