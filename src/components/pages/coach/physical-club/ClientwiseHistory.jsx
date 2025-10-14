import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { datesInRange, nameInitials } from "@/lib/formatter"
import { cn } from "@/lib/utils"
import { clientWiseHistory, clientWiseHistoryClientOptions, statusClases } from "@/lib/physical-attendance"
import { useMemo, useRef, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function TableHeader({ days }) {
  return (
    <thead>
      <tr className="text-sm text-gray-500">
        <th className="px-4 py-2 text-left whitespace-nowrap">Sr No.</th>
        <th className="px-4 py-2 text-left">Name</th>
        {days.map((day) => (
          <th key={day.date} className="px-2 py-1">
            <div>{day.date}</div>
            <div className="text-xs text-gray-400">{day.day}</div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

function TableRow({
  index,
  client
}) {
  return (
    <tr className="text-sm">
      <td className="px-4 py-2">{index}</td>
      <td className="whitespace-nowrap px-4 py-2 flex items-center gap-2">
        <Avatar>
          <AvatarImage src={client.clientProfile} />
          <AvatarFallback>{nameInitials(client?.clientName)}</AvatarFallback>
        </Avatar>
        {client.clientName}
      </td>
      {client.attendanceInRange.map((day, i) => (
        <td key={i} className="px-2 py-1">
          <div
            className={cn("w-6 h-6 mx-auto flex items-center justify-center rounded-md", statusClases(day.status))}
          >
            {nameInitials(day.status) || <>-</>}
          </div>
        </td>
      ))}
    </tr>
  )
}

export function ClientwiseHistory({
  query,
  data,
  range
}) {
  const [selectedClients, setSelectedClients] = useState([])
  const clientSet = new Set(selectedClients)

  const days = datesInRange(range)
  const result = (clientWiseHistory(
    data.filter(item => clientSet.has(item?.client?._id)),
    range
  ) || [])
    .filter(client => new RegExp(query, "i").test(client?.clientName))

  return (
    <TabsContent value="clientwise-history">
      <div className="w-fit ml-auto">
        <SelectClients
          clients={data}
          selectedClients={selectedClients}
          onSelectClients={setSelectedClients}
        />
      </div>
      <Card className="mt-4 p-0 shadow-none border-1 rounded-[10px] bg-[var(--comp-1)]">
        <div className="p-4 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <TableHeader days={days} />
            <tbody>
              {result.map((client, idx) => (
                <TableRow
                  key={idx}
                  index={idx + 1}
                  client={client}
                  days={days}
                />
              ))}
            </tbody>
          </table>
        </div>
        {result.length === 0 && <div
          className="bg-white m-4 border-1 rounded-[6px] h-[200px] flex items-center justify-center font-bold"
        >
          {clientSet.size === 0
            ? <>Please Select a Client</>
            : <>No Matches Found!</>}
        </div>}
      </Card>
    </TabsContent>
  )
}

function SelectClients({
  clients,
  selectedClients,
  onSelectClients
}) {
  const [selected, setSelected] = useState(selectedClients);
  const dialogRef = useRef()

  const clientList = useMemo(() => clientWiseHistoryClientOptions(clients), [])

  return <Dialog>
    <DialogTrigger asChild>
      <Button className="font-bold">Select Clients</Button>
    </DialogTrigger>
    <DialogContent className="p-0 gap-0 max-h-[70vh] overflow-y-auto">
      <DialogTitle className="p-4 border-b-1">Select Clients</DialogTitle>
      <div className="p-4">
        {clientList.map((client, idx) => (
          <label key={client.clientId} className="flex items-center gap-2 mb-4 cursor-pointer">
            <Avatar>
              <AvatarImage src={client.profilePhoto} />
              <AvatarFallback>{nameInitials(client?.clientName)}</AvatarFallback>
            </Avatar>
            <p htmlFor={client.clientId}
              className="mr-auto"
            >
              {client.clientName}
            </p>
            <input
              type="checkbox"
              id={client.clientId}
              checked={selected.includes(client.clientId)}
              value={client.clientId}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelected(prev => [...prev, client.clientId])
                } else {
                  setSelected(prev => prev.filter(id => id !== client.clientId))
                }
              }}
            />
          </label>
        ))}
        <Button
          onClick={() => {
            onSelectClients(selected);
            dialogRef.current?.click();
          }}
        >
          Save
        </Button>
      </div>
      <DialogClose ref={dialogRef} />
    </DialogContent>
  </Dialog>
}