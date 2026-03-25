import Image from "next/image";
import { BODY_COMPOSITION_OPTIONS } from "../utils/config";

export default function BodyComposition({
  selectedValue,
  updateBodyComposition
}) {
  return <div className="grid grid-cols-3 gap-4">
    {BODY_COMPOSITION_OPTIONS.map((composition) => (
      <div
        key={composition.id}
        onClick={() => updateBodyComposition(composition.value)}
        className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center gap-2 transition
                      ${selectedValue === composition.value
            ? "border-green-500 bg-green-50"
            : "hover:bg-gray-50"
          }`}
      >
        <div className="w-20 h-20 border rounded-full">
          <Image
            src={composition.svg || "/not-found.png"}
            onError={(e => e.target.src = "/not-found.png")}
            height={100}
            width={100}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-sm">{composition.title}</span>
      </div>
    ))}
  </div>
}