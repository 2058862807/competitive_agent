import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video as VideoIcon, Loader2, Sparkles, Film } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Video() {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(null);
  const [scriptData, setScriptData] = useState({ duration: 30, focus: '' });
  const [videoScript, setVideoScript] = useState('');

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/video/generate-script`, scriptData);
      setScript(response.data);
      toast.success('Commercial script generated!');
    } catch (error) {
      toast.error('Failed to generate script');
    }
    setLoading(false);
  };

  const handleGenerateVideo = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/video/generate`, {
        script: videoScript,
        voice_type: 'professional'
      });
      toast.success(response.data.message || 'Video generation started!');
    } catch (error) {
      toast.error('Failed to generate video');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Video & Commercial Creation</h1>
        <p className="text-gray-500 mt-1">AI-powered script and video generation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Generate Script */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center space-x-2">
              <Film className="w-6 h-6" />
              <span>Generate Commercial Script</span>
            </CardTitle>
            <CardDescription className="text-purple-100">
              AI creates engaging commercial scripts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Duration (seconds)</Label>
              <Select
                value={scriptData.duration.toString()}
                onValueChange={(value) => setScriptData({...scriptData, duration: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="90">90 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Focus/Topic</Label>
              <Input
                placeholder="e.g., AI Estate Planning, Software Development"
                value={scriptData.focus}
                onChange={(e) => setScriptData({...scriptData, focus: e.target.value})}
              />
            </div>
            <Button onClick={handleGenerateScript} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Script
            </Button>

            {script && (
              <div className="mt-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{script.duration}s Commercial Script</h3>
                  <p className="text-sm text-gray-600 mb-2">Focus: {script.focus}</p>
                  <div className="whitespace-pre-wrap text-gray-800">{script.script}</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setVideoScript(script.script)}
                >
                  Use for Video Generation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Video */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardTitle className="flex items-center space-x-2">
              <VideoIcon className="w-6 h-6" />
              <span>Generate Video</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Turn scripts into professional videos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Script</Label>
              <Textarea
                rows={10}
                placeholder="Paste or generate a script above..."
                value={videoScript}
                onChange={(e) => setVideoScript(e.target.value)}
              />
            </div>
            <div>
              <Label>Voice Type</Label>
              <Select defaultValue="professional">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateVideo} disabled={loading || !videoScript} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <VideoIcon className="w-4 h-4 mr-2" />}
              Generate Video
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Video will be processed and emailed when ready
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold text-lg">AI-Powered Video Creation</h3>
            <p className="text-gray-500 mt-2">
              Generate professional commercial scripts and videos using AI. Perfect for NextAI Global's services:
              AI Estate Planning, Publishing, Software Development, and IT Solutions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
