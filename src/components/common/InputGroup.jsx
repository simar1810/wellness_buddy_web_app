import { Input } from "../ui/input";

export default function InputGroup({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        {...props}
      // className="w-full px-3 py-2 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-black"
      />
    </div>
  );
}