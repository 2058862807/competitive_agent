import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Share2, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function VideoShowcase() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/videos/nextai_commercial.mp4';
    link.download = 'NextAI_Global_Commercial.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Video download started!');
  };

  const handleShare = () => {
    const videoUrl = window.location.origin + '/videos/nextai_commercial.mp4';
    navigator.clipboard.writeText(videoUrl);
    toast.success('Video URL copied to clipboard!');
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="video-showcase-title">
          NextAI Global Commercial
        </h1>
        <p className="text-gray-500 mt-1">
          Professional video presentation of our services
        </p>
      </div>

      {/* Main Video Player */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center space-x-2">
            <VideoIcon className="w-6 h-6" />
            <span>NextAI Trust Commercial</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            AI-powered estate planning and trust management
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-black">
            <video
              className="w-full max-h-[600px] mx-auto"
              controls
              poster="/videos/thumbnail.jpg"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              data-testid="video-player"
            >
              <source src="/videos/nextai_commercial.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white bg-opacity-20 rounded-full p-8 backdrop-blur-sm">
                  <Play className="w-16 h-16 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Video Actions */}
          <div className="p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
                data-testid="download-video-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                data-testid="share-video-btn"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" data-testid="view-script-btn">
                View Script
              </Button>
            </div>

            {/* Video Details */}
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="text-lg font-semibold">~60 seconds</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Format</p>
                <p className="text-lg font-semibold">MP4</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Size</p>
                <p className="text-lg font-semibold">2.1 MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">NextAI Trust Presentation</h3>
              <p className="text-gray-600">
                Professional presentation showcasing NextAI Global's AI-powered estate planning 
                and trust management services. Features our comprehensive approach to secure, 
                personalized legacy management with cutting-edge technology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Key Features Highlighted:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>AI-powered estate planning</li>
                  <li>Personalized trust management</li>
                  <li>Real-time updates</li>
                  <li>Blockchain security</li>
                  <li>Cost-effective solutions</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Target Audience:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>Individuals planning their estate</li>
                  <li>Trust administrators</li>
                  <li>Financial advisors</li>
                  <li>Legal professionals</li>
                  <li>Family offices</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle>Embed on Your Website</CardTitle>
          <CardDescription>Copy this code to embed the video</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>
{`<video width="100%" controls>
  <source src="${window.location.origin}/videos/nextai_commercial.mp4" type="video/mp4">
</video>`}
            </code>
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`<video width="100%" controls><source src="${window.location.origin}/videos/nextai_commercial.mp4" type="video/mp4"></video>`);
              toast.success('Embed code copied!');
            }}
            variant="outline"
            className="w-full mt-3"
          >
            Copy Embed Code
          </Button>
        </CardContent>
      </Card>

      {/* Video Library */}
      <Card>
        <CardHeader>
          <CardTitle>Video Library</CardTitle>
          <CardDescription>All your generated videos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                <VideoIcon className="w-12 h-12 text-purple-500" />
              </div>
              <h4 className="font-semibold">NextAI Trust Commercial</h4>
              <p className="text-sm text-gray-500">60 seconds • 2.1 MB</p>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors cursor-pointer">
              <VideoIcon className="w-12 h-12 mb-2" />
              <p className="text-sm">Generate New Video</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
