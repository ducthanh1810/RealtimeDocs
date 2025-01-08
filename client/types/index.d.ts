/* eslint-disable no-unused-vars */
declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type RoomAccesses = Record<string, AccessType>;

declare type UserType = "creator" | "editor" | "viewer";

declare type RoomMetadata = {
  creatorId: string;
  email: string;
  title: string;
};

declare type CreateDocumentParams = {
  userId: string;
  email: string;
};

export declare type authTokenType = {
  access: string;
  refresh: string;
};

declare type User = {
  user: number;
  full_name: string;
  position: string;
  image: string;
  friends: string[];
  gmail: string;
  role: string;
};

export declare type Profile = {
  id: int;
  image: string;
  user_id: number;
  full_name: string;
  position: string;
  verified: boolean;
  type: boolean;
};

export declare type DocumentType = {
  id: number;
  content: string;
  updated_at: string;
  document_id: string;
  title: string;
  created_at: string;
  author_id: number;
  collaborators: Profile[];
  comments: CommentType[];
};

export declare type CommentType = {
  id: number;
  content: string;
  location: string;
  reaction: string;
  created_at: string;
  updated_at: string;
  resolve: boolean;
  document_id: number;
  user_id: number;
  replies: ReplyType[];
  user: Profile;
};

export declare type ReplyType = {
  id: number;
  content: string;
  reaction: string;
  created_at: string;
  updated_at: string;
  comment_id: number;
  user_id: number;
  user: Profile;
};

export declare type DocumentProps = {
  document_id: string;
  title: string;
  content: string;
};

export declare type CommentProps = {
  document_id: string;
  content: string;
  location: string;
};

declare type EditorProps = {
  State: any;
  setDocumentContent: (content: any) => void;
};

declare type ShareDocumentParams = {
  roomId: string;
  email: string;
  userType: UserType;
  updatedBy: User;
};

declare type UserTypeSelectorParams = {
  userType: string;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
  onClickHandler?: (value: string) => void;
};

declare type ShareDocumentDialogProps = {
  roomId: string;
  collaborators?: Profile[];
  creatorId: number;
  user: User;
};

declare type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

declare type CollaboratorProps = {
  roomId: string;
  email: string;
  creatorId: number;
  collaborator: Profile;
  user: User;
};

declare type CollaborativeRoomProps = {
  roomId: string;
  roomMetadata: RoomMetadata;
  users?: User[];
  currentUserType: UserType;
};

declare type AddDocumentBtnProps = {
  userId: string;
  email: string;
};

declare type DeleteModalProps = { roomId: string };

declare type ThreadWrapperProps = { thread: ThreadData<BaseMetadata> };

export interface WsType {
  push: (data: string) => void;
  subscribe: (
    setData: (data: any) => void,
    setIsMySend: (is: boolean) => void,
    setCollaboratorsAccess: (data: string[]) => void
  ) => void;
  close: () => void;
}

export const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;
