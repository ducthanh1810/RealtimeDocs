import React, { useState } from "react";
import { Button } from "./ui/button";
import { CollaboratorProps, UserType } from "@/types";
import UserTypeSelector from "./UserTypeSelector";
import { DocumentApi } from "@/api/documentApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
}: CollaboratorProps) => {
  const queryClient = useQueryClient();
  const { mutate: UpdateType } = useMutation({
    mutationFn: DocumentApi().UpdateCollaboratorType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document"] });
    },
  });
  const { mutate: RemoveCollaborator } = useMutation({
    mutationFn: DocumentApi().RemoveCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document"] });
    },
  });

  const [userType, setUserType] = useState<UserType>(
    collaborator.type == false ? "viewer" : "editor"
  );
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    UpdateType({
      document_id: roomId,
      collaborator_id: collaborator.user_id,
      type: type,
    });

    setLoading(false);
  };

  const removeCollaboratorHandler = () => {
    setLoading(true);

    RemoveCollaborator({
      document_id: roomId,
      collaborator_id: collaborator.user_id,
    });

    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        {/* <Image
          src={process.env.NEXT_PUBLIC_BASE_API + "/" + collaborator.image}
          alt={collaborator.full_name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        /> */}
        {collaborator && (
          <Avatar>
            <AvatarImage
              src={process.env.NEXT_PUBLIC_BASE_API + "/" + collaborator.image}
            />
            <AvatarFallback className=" uppercase text-xs">
              {collaborator ? collaborator.full_name : "user"}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
            {collaborator.full_name ? collaborator.full_name : "User"}
            <span className="text-10-regular pl-2 text-blue-100">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-sm font-light text-blue-100">
            {collaborator.position}
          </p>
        </div>
      </div>

      {creatorId === collaborator.user_id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            userType={userType as UserType}
            setUserType={setUserType}
            onClickHandler={shareDocumentHandler}
          />
          <Button type="button" onClick={() => removeCollaboratorHandler()}>
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
