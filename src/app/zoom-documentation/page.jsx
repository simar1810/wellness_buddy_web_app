import { Ellipsis, EllipsisVertical } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <div className="max-w-[1200px] bg-white mx-auto my-10 p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Way to Wellness Club Zoom Integration Guide</h1>
        <p className="max-w-[100ch] mt-4">Way to Wellness Club seamlessly integrates with Zoom to help you schedule, manage, and track virtual meetings efficiently. Follow this guide to install and use the Way to Wellness Club Zoom App.</p>

        <h2 className="text-xl font-bold mt-10 mb-2"><strong>Disclaimer</strong></h2>
        <p className="max-w-[100ch]">Way to Wellness Club uses the Zoom OAuth application solely to streamline the process of scheduling and managing meetings for our platform users via their Zoom accounts. The platform enables users to:</p>
        <div className="ml-10">
          <ol className="list-decimal list-inside mt-2">
            <li>Schedule, edit, delete, and retrieve Zoom meetings directly from Way to Wellness Club.</li>
            <li className="mt-2">
              Listen to Zoom event webhooks such as:
              <ol className="ml-4 list-decimal list-inside">
                <li>Meeting started</li>
                <li>Meeting ended</li>
                <li>Participant/Host joined</li>
                <li>Participant/Host left</li>
              </ol>
            </li>
            <li className="mt-2">
              Store the following data in the database from Zoom events:
              <ol className="ml-4 list-decimal list-inside">
                <li>Participant name</li>
                <li>Participant email</li>
                <li>Leave reason</li>
                <li>Timestamps</li>
                <li>Join</li>
                <li>Leave</li>
                <li>Meeting Start</li>
                <li>Meeting End</li>
              </ol>
            </li>
          </ol>
        </div>

        <h2 className="mt-10 text-xl font-bold mb-4">Scopes and Their Applications</h2>
        <div className="ml-10">
          <h2 className="text-xl font-semibold">🔹 1. How to Install Way to Wellness Club Zoom App <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}account:read:account_setting:admin, account:read:entitlement:admin, user:read:user:admin, user:read:zak:admin{")"}</span></h2>
          <ol className="list-decimal list-inside mt-2">
            <li>
              Go to <Link href="https://app.waytowellness.in/login" target="_blank" className="text-blue-600">Way to Wellness Club Login</Link> and
              sign in.
            </li>
            <li>Navigate &gt; <strong className="font-bold">&quot;Club&quot; &gt; &quot;Link Generator&quot; &gt; &quot;With Zoom Meetings&quot; &gt; &quot;Connect Now&quot;</strong>.</li>
            <li>Click on <strong>&quot;Connect Now&quot;</strong>. You will be redirected to Zoom&apos;s authentication page, if Zoom is already connected then you will not see this option.</li>
            <li>Authorize Way to Wellness Club to access your Zoom account.</li>
            <li>After authorization, you will be redirected back to Way to Wellness Club.</li>
          </ol>
          <p className="mt-2 font-bold">✅ Your Zoom account is now connected!</p>

          <h2 className="mt-6 text-xl font-semibold">🔹 2. How to Use the Integration</h2>
          <h3 className="mt-4 text-lg font-semibold">
            📅 Schedule a Zoom Meeting&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:write:meeting:admin{")"}</span>
          </h3>
          <ol className="list-decimal list-inside mt-2">
            <li>Go to <strong className="font-bold">&quot;Club&quot; &gt; &quot;Meetings&quot; &gt; &quot;With Zoom Meetings&quot;</strong>.</li>
            <li>Click <strong>With Zoom Meetings</strong>, if Zoom not connected kindly authorize us your Zoom account to schedule meeting.</li>
            <li>Enter meeting details (Title, Date, Time, Duration, etc as prompted in the form.).</li>
            <li>Click <strong>&quot;Club&quot; &gt; &quot;Link Generator&quot; &gt; &quot;With Zoom Meetings&quot;</strong>. A Zoom meeting link will be generated.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold">
            📋 3. View All Zoom Meetings&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:read:list_meetings:admin{")"}</span>
          </h3>
          <ol className="list-decimal list-inside mt-2">
            <li>Go to <strong>Club &gt; Meetings</strong> to see all scheduled Zoom meetings.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold">
            ✏️ 4. Edit a Zoom Meeting&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:update:meeting:admin{")"}</span>
          </h3>
          <ol className="list-decimal list-inside mt-2">
            <li>Go to <strong>Club &gt; Meetings</strong>.</li>
            <li>Click on the three-dot icon of the meeting you want to edit.</li>
            <li>Update the details and save changes.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold">
            🗑️ 5. Delete a Zoom Meeting&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:delete:meeting:admin{")"}</span>
          </h3>
          <ol className="list-decimal list-inside mt-2">
            <li>Go to <strong>Club &gt; Meetings</strong>.</li>
            <li>Click on the three-dot icon of the meeting you want to delete.</li>
            <li>Click delete and confirm the action.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold leading-[1] mb-4">
            📊 6. Track Meeting Attendance (Webhooks)&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:read:meeting:admin, meeting:read:participant:admin, meeting:read:list_meetings:admin{")"}</span>
          </h3>
          <p>Listening to Zoom webhooks for every meeting is available under <strong>Meetings</strong>. Click on the Zoom meeting link to track attendance.</p>
          <ol className="list-decimal list-inside mt-2">
            <li>Go to <strong>Meetings</strong>.</li>
            <li>Multiple Meetings are displayed in the meetings table.</li>
            <li>Under the Base Link column click on the link Zoom link to check the Zoom events.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold leading-[1] mb-4">
            📊 7. Deauthorize Zoom account&nbsp;
            <span className="text-gray-400 text-[14px] font-regular hover:text-gray-900">{"("}meeting:read:meeting:admin, meeting:read:participant:admin, meeting:read:list_meetings:admin{")"}</span>
          </h3>
          {/* <p>Listening to Zoom webhooks for every meeting is available under <strong>Meetings</strong>. Click on the Zoom meeting link to track attendance.</p> */}
          <ol className="list-decimal list-inside mt-2">
            <li>Click <strong>&quot;Club&quot; &gt; &quot;Link Generator&quot;</strong></li>
            <li>An option with the <strong>&quot;With Zoom Meetings&quot;</strong> a menu icon that is ellipsis-{"("}<EllipsisVertical className="h-[14px] w-[14px] inline" />{")"} Click on this option and disconnect Zoom option will be visible.</li>
          </ol>

          {/* <h2 className="mt-6 text-xl font-semibold">🔹 7. How to Uninstall Way to Wellness Club Zoom App</h2>
        <ol className="list-decimal list-inside mt-2">
          <li>
            Go to <a href="https://marketplace.Zoom.us/user/installed-apps" className="text-blue-600">Zoom Installed Apps</a>.
          </li>
          <li>Find <strong>Way to Wellness Club</strong> and click <strong>“Uninstall”</strong>.</li>
          <li>Confirm the uninstallation to remove all Zoom data from Way to Wellness Club.</li>
        </ol>
        <p className="mt-2 font-bold">🚨 Important: Uninstalling the app will delete all associated Zoom credentials from Way to Wellness Club.</p> */}

          <h2 className="mt-6 text-xl font-semibold">🔹 7. Support & Troubleshooting</h2>
          <p className="mt-2">If you experience issues, contact our support team:</p>
          <ul className="list-disc list-inside mt-2">
            <li>
              📧 <strong>Email:</strong> <a href="mailto:simarpreetsinghc@gmail.in" className="text-blue-600">simarpreetsinghc@gmail.in</a>
            </li>
            <li>
              🌍 <strong>Website:</strong> <a href="https://app.waytowellness.in/" className="text-blue-600">Way to Wellness</a>
            </li>
          </ul>
        </div>

        <p className="mt-6 font-bold">Thank you for using Way to Wellness Club! 🎉</p>
      </div>
    </div >
  );
}