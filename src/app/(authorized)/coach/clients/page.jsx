"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import ClientListItemStatus from "@/components/pages/coach/client/ClientListItemStatus";
import { getAppClients } from "@/lib/fetchers/app";
import { useAppSelector } from "@/providers/global/hooks";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const initialQuery = {
  page: 1,
  limit: 500,
  finalPage: Infinity
}

export default function Page() {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [query, setQuery] = useState(() => initialQuery);
  const { client_categories = [] } = useAppSelector(state => state.coach.data);

  const categories = useMemo(() => {
    const map = new Map();
    for (const category of client_categories) {
      map.set(category._id, category.name)
    }
    return map;
  })

  const { isLoading, error, data } = useSWR(
    `getAppClients?page=${query.page}&limit=${query.limit}`,
    () => getAppClients(query)
  );

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  let clients = [];
  if (selectedCategories.length > 0) {
    for (const client of data.data || []) {
      if (client.categories.find(category => selectedCategories.includes(category))) {
        clients.push(client);
      }
    }
  } else {
    clients = data.data || []
  }

  return <div className="mt-8 content-container">
    <Header
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      categories={client_categories}
    />
    <div className="mt-8 grid grid-cols-2 gap-4 divide-y-1">
      {clients.map((client, index) => <ClientListItemStatus
        key={index}
        categories={categories}
        client={client}
      />)}
    </div>
  </div>
}

function Header({
  selectedCategories,
  setSelectedCategories,
  categories
}) {
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSelectAll = () => {
    const allIds = categories.map((category) => category._id)
    setSelectedCategories(allIds)
  }

  const handleReset = () => {
    setSelectedCategories([])
  }

  const getSelectedNames = () => {
    if (selectedCategories.length === 0) return "Select categories"
    if (selectedCategories.length === categories.length) return "All categories"
    if (selectedCategories.length === 1) {
      const category = categories.find((cat) => cat._id === selectedCategories[0])
      return category?.name || "1 category"
    }
    return `${selectedCategories.length} categories`
  }

  return (
    <div className="w-full max-w-xs">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            {getSelectedNames()}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="flex gap-1 p-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex-1" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex-1" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <DropdownMenuSeparator />

          {categories.map((category) => (
            <DropdownMenuCheckboxItem
              key={category._id}
              checked={selectedCategories.includes(category._id)}
              onCheckedChange={() => handleCategoryToggle(category._id)}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedCategories.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Selected:{" "}
          {selectedCategories
            .map((id) => {
              const category = categories.find((cat) => cat._id === id)
              return category?.name
            })
            .join(", ")}
        </div>
      )}
    </div>
  )
}