
import React from 'react';

interface JsonViewerProps {
  data: object;
  maxHeight?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, maxHeight = '300px' }) => {
  return (
    <pre
      className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm whitespace-pre-wrap break-all overflow-auto"
      style={{ maxHeight }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};
