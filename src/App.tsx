/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Backend API Running</h1>
        <p className="text-gray-600 mb-6">
          The backend is configured and exposing two endpoints:
        </p>
        
        <div className="space-y-4 text-left">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-mono font-medium">POST</span>
              <code className="text-sm font-mono text-gray-800">/api/send</code>
            </div>
            <p className="text-sm text-gray-500">
              Sends a message to Gemini 3 Flash Preview (with low thinking level).<br/>
              Body: <code className="bg-gray-200 px-1 rounded text-xs">{"{ \"message\": \"Your message\" }"}</code>
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-mono font-medium">GET</span>
              <code className="text-sm font-mono text-gray-800">/api/receive</code>
            </div>
            <p className="text-sm text-gray-500">
              Retrieves the chat history from the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
