import YoutubeIntegrationCard from "./YoutubeIntegrationCard";

export default function IntegrationsContainer() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Integrations
        </h1>
        <p className="text-sm text-gray-500">
          Connect third-party services to enhance scheduling
        </p>
      </div>
      <YoutubeIntegrationCard />
    </div>
  );
}