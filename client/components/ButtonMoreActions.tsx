"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MoreActions({
  isOpen,
  setIsEdit,
  DeleteComment,
}: {
  isOpen: boolean;
  setIsEdit: (state: boolean) => void;
  DeleteComment: () => void;
}) {
  const [Open, setOpen] = useState(false);
  return (
    <DropdownMenu open={Open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="w-6 h-6 hover:border-none">
          <Ellipsis className=" hover:cursor-pointer" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          isOpen ? "flex flex-col gap-2 p-1 w-30 h-15 bg-blue-900" : "hidden"
        )}
      >
        <DropdownMenuGroup>
          <Button
            onClick={() => {
              setIsEdit(true);
              setOpen(false);
            }}
            className=" flex gap-1 p-1 w-full justify-between hover:bg-white/10 hover:border-none"
          >
            <span>Edit comment</span>
            <Pencil className="p-1" />
          </Button>
          <DeleteDialog DeleteComment={DeleteComment} />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DeleteDialog({ DeleteComment }: { DeleteComment: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className=" flex gap-1 p-1 w-full justify-between hover:bg-white/10 hover:border-none">
          <span>delete comment</span>
          <Trash className="p-1" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            comment and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={DeleteComment}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
