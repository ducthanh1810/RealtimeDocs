import { Profile } from "@/types";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { GetProfile } from "@/api/auth";

export const AccessingUser = ({
  document_id,
  author_id,
  collaborators,
  collaboratorsAccessing,
}: {
  document_id: number;
  author_id: number;
  collaborators: Profile[];
  collaboratorsAccessing?: string[];
}) => {
  const { data, isSuccess } = useQuery({
    queryKey: [`author_${document_id}`],
    queryFn: () => GetProfile().GetAuthorDocument(document_id),
  });
  return (
    <div className="flex p-1 gap-1 items-center">
      {isSuccess && (
        <Avatar
          className={cn(
            collaboratorsAccessing?.includes(author_id.toString())
              ? "opacity-100"
              : "opacity-50",
            "h-6 w-6 sm:w-8 sm:h-8"
          )}
        >
          <AvatarImage
            src={process.env.NEXT_PUBLIC_BASE_API + "/" + data?.data.image}
          />
          <AvatarFallback className=" uppercase text-xs">
            {data?.data.full_name ? data?.data.full_name : "user"}
          </AvatarFallback>
        </Avatar>
      )}
      {collaborators.map(
        (collaborator, index) =>
          index < 2 && (
            <Avatar
              className={cn(
                collaboratorsAccessing?.includes(
                  collaborator.user_id.toString()
                )
                  ? "opacity-100"
                  : "opacity-50",
                "h-6 w-6 sm:w-8 sm:h-8"
              )}
            >
              <AvatarImage
                src={
                  process.env.NEXT_PUBLIC_BASE_API + "/" + collaborator.image
                }
              />
              <AvatarFallback className=" uppercase text-xs">
                {collaborator.full_name ? collaborator.full_name : "user"}
              </AvatarFallback>
            </Avatar>
          )
      )}
      {collaborators.length > 2 && (
        <span className=" opacity-80 pt-2">...</span>
      )}
    </div>
  );
};
