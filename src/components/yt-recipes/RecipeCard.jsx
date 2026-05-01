import { MoreVertical, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UpdateYTRecipeVideo from "./UpdateYTRecipeVideo";
import DeleteYTRecipeVideo from "./DeleteYTRecipeVideo";

const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

export default function RecipeCard({ item, currentSWRKey }) {
  const embedUrl = getEmbedUrl(item.ytLink);

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <div className="relative aspect-video w-full bg-slate-900">
        {embedUrl ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Play className="w-8 h-8 opacity-20" />
            <span className="text-[10px] uppercase tracking-wider font-medium">Link Preview Unavailable</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <UpdateYTRecipeVideo item={item} currentSWRKey={currentSWRKey} />
          <DeleteYTRecipeVideo videoId={item._id} currentSWRKey={currentSWRKey} />
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <div className="space-y-1">
          <h3 className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description || "No description provided for this recipe tutorial."}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {item.availability?.length > 0 ? (
            item.availability.map((tag, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-[10px] font-medium px-2 py-0 border-slate-200 bg-slate-50 text-slate-600 capitalize"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">General Access</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}