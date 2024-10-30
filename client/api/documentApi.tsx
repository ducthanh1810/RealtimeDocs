import { DocumentProps, CommentProps } from "@/types";
import useAxios from "./useAxios";

export function DocumentApi() {
  const api = useAxios();
  const GetList = () => {
    return api.get(`/api/documents/`);
  };
  const Get = (id: string) => {
    return api.get(`/api/document/${id}`);
  };
  const GetCollaborators = (document_id: any) => {
    return api.get(`api/documents/collaborators/${document_id}`);
  };
  const GetCollaboratorType = (document_id: any, collaborator_id: any) => {
    return api.get(
      `api/documents/collaborator/${document_id}/${collaborator_id}`
    );
  };
  const UpdateTitle = ({
    document_id,
    title,
  }: {
    document_id: string;
    title: string;
  }) => {
    return api.put(`/api/document/title/${document_id}`, { title: title });
  };
  const CreateDocument = ({ document_id, title, content }: DocumentProps) => {
    return api.post(`/api/document/`, {
      document_id,
      title,
      content,
    });
  };

  const DeleteDocument = ({ document_id }: { document_id: any }) => {
    return api.delete(`/api/document/${document_id}`);
  };

  const AddCollaborator = ({
    document_id,
    collaborator_id,
  }: {
    document_id: any;
    collaborator_id: any;
  }) => {
    return api.post(
      `/api/document/collaborator/${document_id}/${collaborator_id}`
    );
  };
  const UpdateCollaboratorType = ({
    document_id,
    collaborator_id,
    type,
  }: {
    document_id: any;
    collaborator_id: any;
    type: string;
  }) => {
    return api.put(`/api/document/collaborator/`, {
      document_id,
      collaborator_id,
      type,
    });
  };
  const RemoveCollaborator = ({
    document_id,
    collaborator_id,
  }: {
    document_id: any;
    collaborator_id: any;
  }) => {
    return api.delete(
      `/api/document/collaborator/${document_id}/${collaborator_id}`
    );
  };
  return {
    GetList,
    Get,
    DeleteDocument,
    GetCollaborators,
    GetCollaboratorType,
    UpdateTitle,
    CreateDocument,
    AddCollaborator,
    UpdateCollaboratorType,
    RemoveCollaborator,
  };
}

export function CommentApi() {
  const api = useAxios();
  const GetList = (document_id: any) => {
    return api.get(`/api/comments/${document_id}`);
  };
  const Get = (id: string) => {
    return api.get(`/api/comment/${id}`);
  };
  const GetReplies = (comment_id: number) => {
    return api.get(`/api/replies/${comment_id}`);
  };
  const CreateComment = ({ document_id, content, location }: CommentProps) => {
    return api.post(`/api/comment/${document_id}`, {
      content,
      location,
    });
  };

  const UpdateComment = ({
    comment_id,
    content,
    location,
  }: {
    comment_id: any;
    content: string;
    location: string;
  }) => {
    return api.put(`/api/comment/${comment_id}`, { content, location });
  };

  const UpdateCommentReaction = ({
    comment_id,
    reaction,
  }: {
    comment_id: any;
    reaction: string;
  }) => {
    return api.put(`/api/comment/${comment_id}/reaction`, {
      reaction,
    });
  };

  const UpdateCommentResolve = ({ comment_id }: { comment_id: any }) => {
    return api.put(`/api/comment/${comment_id}/resolve`);
  };

  const DeleteComment = ({ comment_id }: { comment_id: any }) => {
    return api.delete(`/api/comment/${comment_id}`);
  };

  return {
    GetList,
    Get,
    GetReplies,
    UpdateComment,
    UpdateCommentReaction,
    UpdateCommentResolve,
    CreateComment,
    DeleteComment,
  };
}

export function ReplyApi() {
  const api = useAxios();
  const Get = (id: string) => {
    return api.get(`/api/reply/${id}`);
  };
  const GetList = (comment_id: string) => {
    return api.get(`/api/replies/${comment_id}`);
  };
  const CreateReply = ({
    comment_id,
    content,
  }: {
    comment_id: any;
    content: any;
  }) => {
    return api.post(`/api/reply/${comment_id}`, {
      content,
    });
  };

  const UpdateReply = ({
    reply_id,
    content,
  }: {
    reply_id: any;
    content: string;
  }) => {
    return api.put(`/api/reply/${reply_id}`, { content });
  };

  const UpdateReplyReaction = ({
    reply_id,
    reaction,
  }: {
    reply_id: any;
    reaction: string;
  }) => {
    return api.put(`/api/reply/${reply_id}/reaction`, {
      reaction,
    });
  };

  const DeleteReply = ({ reply_id }: { reply_id: any }) => {
    return api.delete(`/api/reply/${reply_id}`);
  };

  return {
    GetList,
    Get,
    UpdateReply,
    UpdateReplyReaction,
    CreateReply,
    DeleteReply,
  };
}
