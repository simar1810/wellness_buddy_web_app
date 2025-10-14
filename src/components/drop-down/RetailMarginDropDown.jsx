import { PenLine } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";

export default function RetailMarginDropDown({
  margins,
  setMargin,
  setOpen,
  brand,
  children
}) {
  const [modalOpened, setModalOpened] = useState(false)
  return <DropdownMenu
    open={modalOpened}
    onOpenChange={() => setModalOpened(false)}
  >
    <DropdownMenuTrigger asChild onClick={() => setModalOpened(true)}>
      <span>
        {children}
        {!children && <div>
          <Image
            src={brand.image || "/not-found.png"}
            alt=""
            height={540}
            width={540}
            className="object-cover shadow-md shadow-[#808080]/80"
          />
          <p className="px-1 text-left mt-2 font-bold">{brand.name}</p>
        </div>}
      </span>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start" sideOffset={10}>
      <DropdownMenuLabel className="font-bold">Select your margin</DropdownMenuLabel>
      {margins.map((margin, index) => <DropdownMenuItem
        key={index}
        checked={true}
        onClick={() => {
          setMargin(margin)
          setOpen(true)
          setModalOpened(false)
        }}
        className="cursor-pointer"
      >
        {margin}
      </DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
}