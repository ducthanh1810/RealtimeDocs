"use client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogUser } from "@/components/layout/UserSetting/dialoguser";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GetProfile } from "@/api/auth";
import { logOut } from "@/lib/authActions";

export function UserSettingButton() {
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => GetProfile().Get(),
  });

  const Logout = () => {
    logOut();
    localStorage.removeItem("authTokens");
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className=" rounded-full">
          {user && (
            <Avatar>
              <AvatarImage
                src={process.env.NEXT_PUBLIC_BASE_API + user.data.image}
              />
              <AvatarFallback className=" uppercase text-xs">
                {user.data ? user.data.role : "user"}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" w-44 bg-blue-900">
        <DropdownMenuLabel className=" uppercase text-center">
          {user ? user.data.full_name : "user"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className=" hr-solid" />
        <DropdownMenuGroup>
          <DialogUser user={user?.data} />
        </DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer" onClick={Logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
