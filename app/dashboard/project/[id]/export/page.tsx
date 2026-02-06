'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';

export default function ExportPage() {
  const [resolution, setResolution] = useState('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const params = useParams();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${params.id}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error(error);
      alert('An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Export Video</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <VideoPlayer src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-400 mb-2">Format</label>
                <select id="format" className="w-full bg-gray-800 border-gray-700 rounded-lg p-2" disabled>
                  <option>MP4</option>
                </select>
              </div>
              <div>
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-400 mb-2">Resolution</label>
                <select 
                  id="resolution" 
                  className="w-full bg-gray-800 border-gray-700 rounded-lg p-2"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option>1080p</option>
                  <option>1440p</option>
                  <option>2160p</option>
                </select>
              </div>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all disabled:bg-gray-600"
              >
                {isExporting ? 'Exporting...' : 'Export Video'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
