import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Marketing() {
  const [loading, setLoading] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [postData, setPostData] = useState({ topic: '', platform: 'linkedin' });
  const [campaignType, setCampaignType] = useState('');

  const handleGeneratePost = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/marketing/generate-post`, postData);
      setGeneratedPost(response.data);
      toast.success('Social post generated!');
    } catch (error) {
      toast.error('Failed to generate post');
    }
    setLoading(false);
  };

  const handleGenerateCampaign = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/marketing/campaign`, {
        campaign_type: campaignType
      });
      setCampaign(response.data);
      toast.success('Marketing campaign generated!');
    } catch (error) {
      toast.error('Failed to generate campaign');
    }
    setLoading(false);
  };

  const handlePostToSocial = async () => {
    if (!generatedPost) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/api/marketing/post`, {
        platform: generatedPost.platform,
        content: generatedPost.content
      });
      toast.success(response.data.message || 'Posted to social media!');
    } catch (error) {
      toast.error('Failed to post');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
        <p className="text-gray-500 mt-1">AI-powered social media and marketing campaigns</p>
      </div>

      <Tabs defaultValue="post" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="post">Social Media Post</TabsTrigger>
          <TabsTrigger value="campaign">Marketing Campaign</TabsTrigger>
        </TabsList>

        <TabsContent value="post">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" />
                <span>Generate Social Media Post</span>
              </CardTitle>
              <CardDescription className="text-purple-100">
                AI creates optimized content for each platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Topic</Label>
                <Input
                  placeholder="What should the post be about?"
                  value={postData.topic}
                  onChange={(e) => setPostData({...postData, topic: e.target.value})}
                />
              </div>
              <div>
                <Label>Platform</Label>
                <Select
                  value={postData.platform}
                  onValueChange={(value) => setPostData({...postData, platform: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGeneratePost} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Post
              </Button>

              {generatedPost && (
                <div className="mt-4 space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-purple-900">Generated for {generatedPost.platform}</span>
                      <span className="text-sm text-purple-600">Confidence: {generatedPost.confidence}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800">{generatedPost.content}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handlePostToSocial} className="flex-1">Post Now</Button>
                    <Button variant="outline" className="flex-1">Copy to Clipboard</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaign">
          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle>Generate Marketing Campaign</CardTitle>
              <CardDescription className="text-orange-100">
                Complete multi-channel marketing strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Campaign Type</Label>
                <Input
                  placeholder="e.g., Product Launch, Brand Awareness, Lead Generation"
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerateCampaign} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Campaign
              </Button>

              {campaign && (
                <div className="mt-4">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">Campaign Strategy</h3>
                    <div className="whitespace-pre-wrap text-gray-800">{campaign.strategy}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
