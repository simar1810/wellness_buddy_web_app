import { PenLine } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";

export default function RetailMarginDropDown({
  margins,
  setMargin,
  setOpen,
  brand,
  children,
}) {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <DropdownMenu
      open={modalOpened}
      onOpenChange={() => setModalOpened(false)}
    >
      <DropdownMenuTrigger
        asChild
        onClick={() => setModalOpened(true)}
        className="cursor-pointer"
      >
        <span className="flex items-center gap-2 p-2 active:scale-[0.97] transition">
          {children}

          {!children && (
            <div className="w-full sm:w-auto">
              <Image
                src={brand.image || "/not-found.png"}
                alt=""
                height={300}
                width={300}
                className="object-cover rounded-md shadow-md shadow-[#808080]/80 w-full h-auto max-h-[180px] sm:max-h-[240px]"
              />
              <p className="px-1 text-left mt-2 font-semibold text-sm sm:text-base">
                {brand.name}
              </p>
            </div>
          )}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={10}
        align="start"
        className="
          w-[80vw] max-w-sm sm:max-w-none 
          sm:w-auto 
          max-h-[60vh] overflow-y-auto
          rounded-lg p-2
        "
        side="bottom"
      >
        <DropdownMenuLabel className="font-bold text-sm sm:text-base">
          Select your margin
        </DropdownMenuLabel>

        {margins.map((margin, index) => (
          <DropdownMenuItem
            key={index}
            className="cursor-pointer text-sm sm:text-base py-2"
            onClick={() => {
              setMargin(margin);
              setOpen(true);
              setModalOpened(false);
            }}
          >
            {margin}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
