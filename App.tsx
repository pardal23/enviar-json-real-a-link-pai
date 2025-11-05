
import React, { useState, useCallback } from 'react';
import { Status } from './types';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { JsonViewer } from './components/JsonViewer';

const DEFAULT_JSON = {
  "action": "openProductImage",
  "url": "https://dummyjson.com/products/1",
  "authorized": true,
  "request_id": "a1b2-c3d4-e5f6"
};

const App: React.FC = () => {
  const [jsonObject, setJsonObject] = useState<object>(DEFAULT_JSON);
  const [editText, setEditText] = useState<string>(JSON.stringify(DEFAULT_JSON, null, 2));
  const [remoteUrl, setRemoteUrl] = useState<string>('https://httpbin.org/post');
  const [status, setStatus] = useState<Status>({ message: 'Ready. You can edit the JSON and send it.', isError: false });
  const [serverResponse, setServerResponse] = useState<string>('(no response yet)');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setStatusMessage = (message: string, isError: boolean = false) => {
    setStatus({ message: `Status: ${message}`, isError });
  };

  const handleApply = useCallback(() => {
    if (!editText.trim()) {
      setStatusMessage('Nothing to apply.', true);
      return;
    }
    try {
      const parsed = JSON.parse(editText);
      setJsonObject(parsed);
      setStatusMessage('JSON applied successfully.');
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      setStatusMessage(`Invalid JSON: ${error}`, true);
    }
  }, [editText]);

  const handleValidate = useCallback(() => {
    if (!editText.trim()) {
      setStatusMessage('Editor is empty.', true);
      return;
    }
    try {
      JSON.parse(editText);
      setStatusMessage('JSON is valid.');
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      setStatusMessage(`Invalid JSON: ${error}`, true);
    }
  }, [editText]);
  
  const handleClear = () => {
    setEditText('');
    setStatusMessage('Editor cleared.');
  };

  const handleReset = () => {
    setJsonObject(DEFAULT_JSON);
    setEditText(JSON.stringify(DEFAULT_JSON, null, 2));
    setStatusMessage('Example restored.');
  };

  const handleFetchRequest = useCallback(async (method: 'GET' | 'POST') => {
    if (!remoteUrl.trim()) {
      setStatusMessage('Please provide a destination URL.', true);
      return;
    }
    setIsLoading(true);
    setServerResponse('Loading...');
    setStatusMessage(`Sending ${method} request...`);

    const directUrl = remoteUrl.trim();
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;

    const options: RequestInit = {
      method,
      headers: { 'Accept': 'application/json' },
    };

    if (method === 'POST') {
      options.headers = { ...options.headers, 'Content-Type': 'application/json' };
      options.body = JSON.stringify(jsonObject);
    }

    const tryFetch = async (url: string, isProxy: boolean) => {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();
      const responseText = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      setServerResponse(responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return isProxy ? 'Request successful via CORS proxy (fallback).' : 'Direct request successful.';
    };

    try {
      const successMessage = await tryFetch(directUrl, false);
      setStatusMessage(successMessage);
    } catch (e) {
      console.warn('Direct fetch failed, trying proxy:', e);
      try {
        const successMessage = await tryFetch(proxyUrl, true);
        setStatusMessage(successMessage);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error';
        setStatusMessage(`Request failed completely: ${error}`, true);
        setServerResponse(`Error: ${error}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [remoteUrl, jsonObject]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">JSON Editor & API Tool</h1>
          <p className="mt-2 text-lg text-gray-600">A modern tool to inspect, modify, and transmit JSON data packets.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Card */}
          <div className="lg:col-span-2">
            <Card title="1) JSON Editor">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Current JSON Data</h3>
                  <JsonViewer data={jsonObject} />
                </div>
                <div>
                  <label htmlFor="jsonEdit" className="text-lg font-semibold text-gray-700">Edit / Create New JSON</label>
                  <textarea
                    id="jsonEdit"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder='Paste or write your JSON here'
                    className="w-full h-64 mt-2 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <Button onClick={handleApply} disabled={isLoading} variant="primary">Apply JSON</Button>
                <Button onClick={handleValidate} disabled={isLoading}>Validate</Button>
                <Button onClick={handleClear} disabled={isLoading}>Clear</Button>
                <Button onClick={handleReset} disabled={isLoading}>Reset Example</Button>
              </div>
              <div className={`mt-4 p-3 rounded-lg border text-sm ${status.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                {status.message}
              </div>
            </Card>
          </div>

          {/* Side Cards */}
          <div className="flex flex-col gap-6">
            {/* API Interaction Card */}
            <Card title="2) Send / Receive JSON">
              <div>
                <label htmlFor="remoteUrl" className="block text-sm font-medium text-gray-700">Destination URL</label>
                <input
                  type="text"
                  id="remoteUrl"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="e.g., https://httpbin.org/post"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => handleFetchRequest('POST')} disabled={isLoading} variant="primary">
                  {isLoading ? 'Sending...' : 'Send JSON (POST)'}
                </Button>
                <Button onClick={() => handleFetchRequest('GET')} disabled={isLoading}>
                  {isLoading ? 'Requesting...' : 'Request JSON (GET)'}
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-500">APIs like httpbin.org or dummyjson.com are CORS-friendly.</p>
              <hr className="my-4" />
              <div>
                <label className="block text-sm font-medium text-gray-700">Server Response</label>
                <pre className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs whitespace-pre-wrap break-all max-h-60 overflow-auto">
                  {serverResponse}
                </pre>
              </div>
            </Card>

            {/* Example Preview Card */}
            <Card title="3) Current Example Preview">
              <JsonViewer data={jsonObject} maxHeight="260px" />
            </Card>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> This app runs locally. An automatic proxy is used as a fallback if a server blocks CORS. No data is stored.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
