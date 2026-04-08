"use client";

import { Link } from "react-router";
import useDialogState from "@/shared/hooks/use-dialog-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { SignOutDialog } from "@/shared/components/common/sign-out-dialog";
import { useAppSelector } from "@/store/store";
import type { User } from "@/shared/types/auth/users.types";
import { Badge } from "@/shared/components/ui/badge";

export function ProfileDropdown() {

  const [open, setOpen] = useDialogState();
  const user = useAppSelector((state) => state.auth.user) as User | null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.thumbUrl} alt="user_avater" />
              <AvatarFallback>{user?.name?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm leading-none font-medium">{user?.name ?? 'Username'}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {user?.email ?? 'example@gmail.com'}
              </p>
              <Badge className="text-xs bg-blue-100 px-3 py-1 rounded-full text-blue-600 mt-1">{user?.role?.displayName}</Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings/profile" className="cursor-pointer">
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="cursor-pointer">
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </Link>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)} className="cursor-pointer">
            Sign out
            <DropdownMenuShortcut className="text-current">
              ⇧⌘Q
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  );
}
