import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Button } from "@/shared/components/ui/button";
import { useGetAllRolesQuery, useGetRoleByIdQuery } from "@/store/features/app/role/roleApiService";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = {
  _id: string;
  displayName: string;
  name: string;
};

export function RoleSelectField({
  field,
  disabled,
}: {
  field: { value?: string | any; onChange: (v: string) => void };
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Fetch roles with search - use higher limit to get all roles
  const { data, isLoading } = useGetAllRolesQuery({
    page: 1,
    limit: 100, // Get all roles
    search: query,
  });

  // Fetch single role (for edit mode)
  // Handle both string ID and object with _id (from backend population)
  const roleId = typeof field.value === 'object' ? field.value?._id : field.value;
  const { data: singleData } = useGetRoleByIdQuery(roleId!, {
    skip: !roleId,
  });

  const list: Role[] = Array.isArray(data?.data) ? data.data : [];

  // Normalize field.value to handle both string and object formats
  const normalizedValue = typeof field.value === 'object' ? field.value?._id : field.value;

  const selected =
    list.find((r) => r._id === normalizedValue) ||
    (singleData?.data?._id &&
    singleData.data._id === normalizedValue
      ? singleData.data
      : undefined);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="w-full justify-between"
        >
          {selected ? (selected.displayName || selected.name) : "Select Role..."}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput
            placeholder="Search roles..."
            onValueChange={setQuery}
          />

          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>

            <CommandGroup>
              {isLoading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Loading...
                </div>
              )}

              {!isLoading &&
                list.map((role) => {
                  const displayName = role.displayName || role.name;
                  const isSelected = role._id === normalizedValue;
                  return (
                    <CommandItem
                      key={role._id}
                      value={displayName}
                      onSelect={() => {
                        field.onChange(role._id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{displayName}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({role.name})
                      </span>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
