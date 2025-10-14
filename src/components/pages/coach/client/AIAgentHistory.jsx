"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, RotateCcw, Activity, Brain, Utensils, Lightbulb, X } from "lucide-react"
import { format } from "date-fns"
import { TabsContent } from "@/components/ui/tabs"
import useSWR from "swr"
import { retrieveAIAgentHistory } from "@/lib/fetchers/app"
import { useParams } from "next/navigation"
import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import CalenderModal from "@/components/common/CalenderModal"

const sampleData = {
  _id: "68a4362b50cb8c4371a1c4b5",
  person: "client",
  calories: 660,
  carbohydrates: 124,
  fats: 9.7,
  protein: 15.6,
  history: [
    {
      type: "Food",
      question: "Rajma Chawal",
      _id: "68a55ddea31aa573ad963644",
      date: "2025-08-20T05:32:14.405Z",
    },
    {
      type: "Mood",
      question: "Nice To Meet You",
      _id: "68a55da4a31aa573ad963613",
      date: "2025-08-20T05:31:16.436Z",
    },
    {
      type: "Exercise",
      question: "Push Ups",
      _id: "68a55df7a31aa573ad963676",
      date: "2025-08-20T05:32:39.345Z",
    },
    {
      type: "Mood",
      question: "Feeling Low",
      _id: "68a55e18a31aa573ad9636a9",
      date: "2025-08-20T05:33:12.434Z",
    },
    {
      type: "Guidance",
      question: "Help me in creating a daily schedule",
      _id: "68a55e30a31aa573ad9636c9",
      date: "2025-08-20T05:33:36.193Z",
    },
    {
      type: "Food",
      question: "Breakfast Bowl",
      _id: "68a43c1247fdd75a6321b16c",
      date: "2025-08-19T08:55:46.886Z",
    },
    {
      type: "Exercise",
      question: "Morning Jog",
      _id: "68a43a8f92a59e1380d55693",
      date: "2025-08-19T08:49:19.993Z",
    },
  ],
}

const typeIcons = {
  Food: Utensils,
  Mood: Brain,
  Exercise: Activity,
  Guidance: Lightbulb,
}

const typeColors = {
  Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Mood: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Exercise: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Guidance: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export default function AIAgentHistory() {
  const { id } = useParams()

  const [selectedType, setSelectedType] = useState("all")
  const [selectedDate, setSelectedDate] = useState(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { data, isLoading, error } = useSWR(
    `client/ai-history/${format(selectedDate, "dd-MM-yyyy")}`,
    () => retrieveAIAgentHistory(id, format(selectedDate, "dd-MM-yyyy"))
  )

  if (isLoading) return <ContentLoader />

  if (error || !data || [400, 500].includes(data.status_code)) return <ContentError title={error || data?.message} />

  const availableTypes = ['Food', 'Mood', 'Exercise', 'Guidance']

  let filteredHistory = data.history || []
  if (selectedType !== "all") {
    filteredHistory = filteredHistory.filter((item) => item.type === selectedType)
  }

  const handleReset = () => {
    setSelectedType("all")
    setSelectedDate(null)
    setIsCalendarOpen(false)
  }

  return (
    <TabsContent value="ai-agent">
      <div className="space-y-6">
        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg">Nutrition Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.calories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.protein}g</div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.carbohydrates}g</div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{data.fats}g</div>
                <div className="text-sm text-muted-foreground">Fats</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg">Filter History</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CalenderModal
                date={selectedDate}
                setDate={setSelectedDate}
                setOpen={setIsCalendarOpen}
                open={isCalendarOpen}
                className="ml-auto"
              />
              <div className="flex-shrink-0 self-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg flex items-center justify-between">
              Activity History
              <Badge variant="secondary" className="ml-2">
                {filteredHistory.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No entries found for the selected filters.</div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const Icon = typeIcons[item.type]
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${typeColors[item.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <p className="font-medium truncate">{item.question || "No description available"}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}
