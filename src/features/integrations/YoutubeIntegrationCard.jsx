import { buildUrlWithQueryParams } from "@/lib/formatter";
import { useAppSelector } from "@/providers/global/hooks";
import { RefreshCw, Youtube } from "lucide-react";

const YT_REDIRECTION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YT_OAUTH_CLIENT_ID =
  "834817880706-lp0dk4hsgt1bdluo8lugffk200spgn1a.apps.googleusercontent.com";
// "92110669040-tjdv1tdl21qs0d1dk5epe4lhrb7cjqqi.apps.googleusercontent.com"
const YT_RESPONSE_TYPE = "code";
const YT_REDIRECT_URL =
  "https://api.waytowellness.in/api/app/youtube/oauth";
// "https://fb7e-42-108-236-232.ngrok-free.app/api/app/youtube/oauth"
const YT_SCOPES = ["https://www.googleapis.com/auth/youtube"];

export default function YoutubeIntegrationCard() {
  const { features, ytDocRef, _id } = useAppSelector(
    (state) => state.coach.data
  );

  const isEnabled = features?.includes(6);
  const isConnected = Boolean(ytDocRef);

  function redirectToYoutube() {
    try {
      const endpoint = buildUrlWithQueryParams(YT_REDIRECTION_URL, {
        client_id: YT_OAUTH_CLIENT_ID,
        response_type: YT_RESPONSE_TYPE,
        redirect_uri: YT_REDIRECT_URL,
        scope: YT_SCOPES.join(" "),
        state: _id,
        access_type: "offline",
        prompt: "consent",
      });

      window.location.href = endpoint;
    } catch (err) {
      toast.error("Failed to start YouTube connection");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
          <Youtube size={20} className="text-red-600" />
        </div>

        <div>
          <p className="font-semibold text-gray-900">YouTube</p>
          <p className="text-xs text-gray-500">
            Import and manage course videos directly from YouTube
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isEnabled ? (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
            Not Enabled
          </span>
        ) : (
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${isConnected
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
              }`}
          >
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        )}

        {isEnabled && !isConnected && (
          <button
            onClick={redirectToYoutube}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 transition"
          >
            <RefreshCw size={16} />
            Connect
          </button>
        )}
      </div>
    </div>
  );
}