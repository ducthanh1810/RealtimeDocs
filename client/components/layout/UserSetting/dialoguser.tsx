"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserType } from "@/types";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

export function DialogUser({ user }: { user: UserType }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setName(user?.full_name);
    setPosition(user?.position);
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className=" border-0 w-full h-8 items-center justify-start pl-2 font-normal text-base"
          variant="ghost"
        >
          <>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            {"Make changes to your profile here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Avatar:
            </Label>
            <Input
              id="img"
              type="file"
              accept="image/*"
              onChange={(e) => console.log(e.target.files)}
              className="col-span-3"
            />
          </div> */}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên:
            </Label>
            <Input
              id="name"
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Chức vụ:
            </Label>
            <Input
              id="position"
              defaultValue={position}
              onChange={(e) => setPosition(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
