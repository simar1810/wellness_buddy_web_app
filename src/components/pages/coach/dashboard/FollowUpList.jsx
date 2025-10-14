import { parse } from "date-fns";
import ClientListFollowUp from "./ClientListFollowUp";

export default function FollowUpList({
  title = "Pending Follow Up",
  clients
}) {
  const sortedClients = clients.sort((a, b) => {
    const dateA = parse(a.nextFollowup, "dd-MM-yyyy", new Date())
    const dateB = parse(b.nextFollowup, "dd-MM-yyyy", new Date())
    return dateA - dateB
  })
  return <div className="bg-white mt-4 py-4 rounded-[10px] border-1">
    <div className="text-[14px] font-bold mb-4 px-4">{title}</div>
    <div className="divide-y-1 divide-[#ECECEC]">
      {sortedClients.map(client => <ClientListFollowUp
        key={client.clientId}
        src={client.profilePhoto}
        name={client.name}
        id={client.clientId}
        client={client}
      />)}
    </div>
  </div>
}