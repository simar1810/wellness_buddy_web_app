"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Input } from "../ui/input";
import { Search, ChevronRight, Layers } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  sidebar__coachContent,
  sidebar__coachFooter,
} from "@/config/data/sidebar";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { fetchData } from "@/lib/api";
import useDebounce from "@/hooks/useDebounce";
import Loader from "./Loader";
import useClickOutside from "@/hooks/useClickOutside";
import ContentError from "./ContentError";
import { useAppSelector } from "@/providers/global/hooks";
import PendingClientClubDataModal from "../modals/client/PendingClientClubDataModal";
import { DialogTrigger } from "../ui/dialog";
import { useSWRConfig } from "swr";
import useSWR from "swr";
import { SearchBar } from "./AppNavbar";
import { isCoach, getUserType, getUserPermissions } from "@/lib/permissions";
import { getToolTabs } from "@/lib/fetchers/app";
import { catalogTabsForNav } from "@/lib/tool-tabs";

export default function AppSidebar() {
  const [Modal, setModal] = useState();
  const { organisation, features, clubType } = useAppSelector((state) => state.coach.data);

  let sidebarItems = sidebar__coachContent;
  if (!features.includes(3)) sidebarItems = sidebarItems.filter(item => item.id !== 13)
  // Wallet is now available for all organizations
  if (organisation !== "Herbalife") sidebarItems = sidebarItems.filter(item => item.id !== 7);
  if (!features.includes(4)) sidebarItems = sidebarItems.filter(item => item.id !== 6);
  if (!["System Leader"].includes(clubType)) {
    sidebarItems = sidebarItems.filter(item => item.id !== 3.7);
    sidebarItems = sidebarItems.filter((item) => !item.systemLeaderOnly);
    sidebarItems = sidebarItems.map((item) => {
      if (!item.items) return item;
      return {
        ...item,
        items: item.items.filter((sub) => !sub.systemLeaderOnly),
      };
    });
  }
  if (!["System Leader", "Club Leader", "Club Leader Jr", "Club Captain"].includes(clubType)) {
    sidebarItems = sidebarItems.filter(item => item.id !== 14);
    sidebarItems = sidebarItems.filter(item => item.id !== 11)
  }

  // Filter sidebar items based on user permissions
  sidebarItems = sidebarItems.filter(item => {
    // If no permission specified, always show
    if (!item.permission) return true;

    // If permission is "coach", only show for coaches
    if (item.permission === "coach") return isCoach();

    // If permission is a number, check if user has that permission
    if (typeof item.permission === "number") {
      const userType = getUserType();
      if (userType === "coach") return true; // Coaches see everything
      if (userType === "user") {
        const userPermissions = getUserPermissions();
        return userPermissions.includes(item.permission);
      }
    }

    return false;
  });
  if (!features.includes(3)) sidebarItems = sidebarItems.filter(item => item.id !== 13);

  const { data: toolTabsData } = useSWR("sidebar-tool-tabs", () =>
    getToolTabs("coach", 1, 50)
  );
  const dynamicTabs = catalogTabsForNav(toolTabsData?.data || []);
  const extras = dynamicTabs.map((tab) => ({
    id: `tool-tab-${tab._id}`,
    icon: tab.icon ? (
      <img
        src={tab.icon}
        alt={tab.name}
        className="icon min-w-[20px] min-h-[20px] w-5 h-5 rounded object-cover"
      />
    ) : (
      <Layers className="min-w-[20px] min-h-[20px]" />
    ),
    title: tab.name,
    url: `/coach/tools/custom-tabs/${tab._id}`,
  }));
  const insertAt = (() => {
    const cmsIndex = sidebarItems.findIndex((item) => item.id === 3.85);
    if (cmsIndex >= 0) return cmsIndex + 1;
    const rewardIndex = sidebarItems.findIndex((item) => item.id === 3.8);
    if (rewardIndex >= 0) return rewardIndex + 1;
    return sidebarItems.length;
  })();
  sidebarItems = [
    ...sidebarItems.slice(0, insertAt),
    ...extras,
    ...sidebarItems.slice(insertAt),
  ];

  return (
    <Sidebar className="w-[204px] bg-[var(--dark-4)] pl-2 pr-0 border-r-1">
      {Modal || <></>}
      <SidebarHeader className="bg-[var(--dark-4)] text-white font-cursive">
        <Image
          src="/logo.png"
          alt="Wellness Buddy logo"
          width={659}
          height={125}
          className="max-w-[10ch] max-h-[80px] mx-auto mt-4 object-contain"
        />
      </SidebarHeader>

      <SearchBar />

      <SidebarContent className="bg-[var(--dark-4)] pr-2 pb-4 no-scrollbar">
        <SidebarGroup>
          <SidebarMenu className="px-0">
            {sidebarItems.map((item) =>
              item.items && item.items.length > 0 ? (
                <MainMenuItemWithDropdown
                  key={item.id}
                  item={item}
                  Modal={Modal}
                  setModal={setModal}
                />
              ) : (
                <SimpleMenuItem
                  key={item.id}
                  item={item}
                  Modal={Modal}
                  setModal={setModal}
                />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu className="px-0">
            {sidebar__coachFooter.map((item) =>
              item.items && item.items.length > 0 ? (
                <MainMenuItemWithDropdown
                  key={item.id}
                  item={item}
                  Modal={Modal}
                  setModal={setModal}
                />
              ) : (
                <SimpleMenuItem
                  key={item.id}
                  item={item}
                  Modal={Modal}
                  setModal={setModal}
                />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
function NestedDropdownItem({ item, Modal, setModal }) {
  const pathname = usePathname();
  const isActive = pathname === item.url || pathname.includes(item.url);

  if (!item.items || item.items.length === 0) {
    if (item.type === "modal") {
      return (
        <DropdownMenuItem
          className={`!text-[var(--comp-4)] [&_.icon]:!text-[var(--comp-4)] text-[14px] mb-[2px] gap-2 cursor-pointer hover:!text-[var(--primary-1)] hover:[&_.icon]:!text-[var(--primary-1)] hover:!bg-[var(--dark-4)] ${isActive
            ? "bg-[var(--accent-1)] !text-[var(--dark-1)] [&_.icon]:!text-[var(--dark-1)]"
            : ""
            }`}
          onClick={() => setModal(<item.Component setModal={setModal} />)}
        >
          {item.icon}
          <span>{item.title}</span>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem
        asChild
        className={`!text-[var(--comp-4)] [&_.icon]:!text-[var(--comp-4)] text-[14px] mb-[2px] gap-2 ${isActive
          ? "bg-[var(--accent-1)] !text-[var(--dark-1)] [&_.icon]:!text-[var(--dark-1)]"
          : "hover:!bg-[var(--dark-3)] hover:!text-[var(--comp-1)] hover:[&_.icon]:!text-[var(--comp-1)]"
          }`}
      >
        <Link href={item.url}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </DropdownMenuItem>
    );
  }

  // If item has sub-items, render as nested dropdown
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className={`!text-[var(--comp-4)] [&_.icon]:!text-[var(--comp-4)] text-[14px] mb-[2px] gap-2 ${isActive
          ? "bg-[var(--accent-1)] !text-[var(--dark-1)] [&_.icon]:!text-[var(--dark-1)]"
          : "hover:!bg-[var(--dark-4)] hover:!text-[var(--comp-1)] hover:[&_.icon]:!text-[var(--comp-1)]"
          }`}
      >
        {item.icon}
        <span>{item.title}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        className="min-w-56 bg-[var(--dark-1)] rounded-none pl-6 pr-2 py-2 border-0 rounded-r-[8px]"
        sideOffset={0}
      >
        <div className="h-full w-[16px] bg-transparent absolute left-0 top-0" />
        {item.items.map((subItem) => (
          <NestedDropdownItem
            key={subItem.id}
            item={subItem}
            Modal={Modal}
            setModal={setModal}
          />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function MainMenuItemWithDropdown({ item, Modal, setModal }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const isActive = pathname === item.url || pathname.includes(item.url);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <SidebarMenuItem className="py-[8px]">
        <DropdownMenuTrigger
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          asChild
          className="p-0 focus:border-none focus:outline-none focus:ring-0 data-[state=open]:ring-0 data-[state=open]:outline-none data-[state=open]:border-transparent"
        >
          <SidebarMenuButton
            className={`w-full !text-[var(--comp-4)] text-[14px] font-[500] px-2 py-[8px] ${isActive
              ? "bg-[var(--accent-1)] !text-[var(--dark-1)]"
              : "hover:text-white hover:!bg-[var(--dark-1)]"
              }`}
          >
            {item.icon}
            <span>{item?.title}</span>
            <ChevronRight className="absolute right-2 top-1/2 translate-y-[-50%]" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
          className="min-w-56 bg-[var(--dark-1)] rounded-none pl-6 pr-2 py-2 border-0 relative rounded-r-[8px]"
          sideOffset={0}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="h-full w-[16px] bg-[var(--dark-4)] absolute left-0 top-0" />
          {item.items.map((subItem) => (
            <NestedDropdownItem
              key={subItem.id}
              item={subItem}
              Modal={Modal}
              setModal={setModal}
            />
          ))}
        </DropdownMenuContent>
      </SidebarMenuItem>
    </DropdownMenu>
  );
}

// Simple menu item without dropdown
function SimpleMenuItem({ item, Modal, setModal }) {
  const pathname = usePathname();
  const isActive = pathname === item.url || pathname.includes(item.url);

  if (item.type === "modal") {
    return (
      <SidebarMenuItem className="py-[8px]">
        <SidebarMenuButton
          onClick={() => setModal(<item.Component setModal={setModal} />)}
          className={`w-full text-[14px] font-[500] px-2 py-[8px] gap-2 ${isActive
            ? "bg-[var(--accent-1)] !text-[var(--dark-1)]"
            : "!text-[var(--comp-4)] hover:text-white hover:!bg-[var(--dark-1)]"
            }`}
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className="py-[8px]">
      <SidebarMenuButton
        asChild
        className={`w-full text-[14px] font-[500] px-2 py-[8px] gap-2 ${isActive
          ? "bg-[var(--accent-1)] !text-[var(--dark-1)]"
          : "!text-[var(--comp-4)] hover:text-white hover:!bg-[var(--dark-1)]"
          }`}
      >
        <Link href={item.url}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function ClientSearchBar({ setModal }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const pathname = usePathname();

  const containerRef = useRef();
  useClickOutside(containerRef, () => setOpen(false));

  const debouncedQuery = useDebounce(searchQuery);

  useEffect(
    function () {
      (async function () {
        try {
          if (debouncedQuery === "") return;
          setLoading(true);
          const response = await fetchData(
            `app/allClient?limit=5&search=${debouncedQuery}`
          );
          if (response.status_code !== 200)
            throw new Error(response.message || "Internal Server Error!");
          setData(response.data);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      })();
    },
    [debouncedQuery]
  );

  if (
    !["/coach/dashboard", "/coach/chats", "/coach/clients"].includes(pathname)
  )
    return <></>;

  return (
    <div
      ref={containerRef}
      className="relative w-full md:min-w-80 md:max-w-[250px] px-4 md:mt-0 z-[50]"
    >
      <div className="relative flex items-center">
        <Search className="w-[16px] h-[16px] text-[#808080] absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search Client..."
          onFocus={() => setOpen(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[var(--primary-1)] w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-[var(--dark-1)] focus:ring-1 focus:ring-[var(--accent-1)] focus:outline-none"
        />
      </div>
      {open && (
        <div className="absolute top-12 left-0 w-full bg-[var(--primary-1)] rounded-md shadow-lg z-[100] border border-gray-300">
          <SearchedResults
            query={searchQuery}
            setQuery={setSearchQuery}
            setModal={setModal}
            loading={loading}
            data={data}
          />
        </div>
      )}
    </div>
  );
}

function SearchedResults({ setModal, loading, data, query, setQuery }) {
  if (loading)
    return (
      <div className="h-[150px] flex items-center justify-center">
        <Loader />
      </div>
    );

  if (data.length === 0)
    return (
      <ContentError
        className="!bg-[var(--comp-1)] !min-h-[150px] text-center mt-0 border-0"
        title="No Client Found!"
      />
    );

  return (
    <div className="divide-y-1 divide-y-white">
      {data.map((client) =>
        client.isVerified ? (
          <ActiveClient client={client} key={client._id} />
        ) : (
          <InactiveClient
            query={query}
            setQuery={setQuery}
            setModal={setModal}
            client={client}
            key={client._id}
          />
        )
      )}
    </div>
  );
}

function ActiveClient({ client }) {
  return (
    <Link
      href={`/coach/clients/${client._id}`}
      className="hover:bg-[var(--accent-1)] hover:text-[var(--dark-1)] text-[var(--dark-1)] text-[12px] px-2 py-2 flex items-center gap-4"
    >
      {client.name}
      <ChevronRight className="w-[16px] h-[16px] ml-auto" />
    </Link>
  );
}

function InactiveClient({ query, setQuery, setModal, client }) {
  const { cache } = useSWRConfig();
  return (
    <div
      className="hover:bg-[var(--accent-1)] hover:text-[var(--primary-1)] text-[var(--dark-1)] text-[12px] px-2 py-2 flex items-center gap-4"
      onClick={() => {
        setModal(
          <PendingClientClubDataModal
            open={true}
            onClose={() => setModal()}
            clientData={client}
            mutateQuery={{
              search: true,
              all: true,
              query: query,
            }}
            onSubmit={() => {
              setModal();
              cache.delete(`app/allClient?limit=5&search=${query}`);
              setQuery();
            }}
          >
            <DialogTrigger />
          </PendingClientClubDataModal>
        );
      }}
    >
      {client.name}
      <ChevronRight className="w-[16px] h-[16px] ml-auto" />
    </div>
  );
}
