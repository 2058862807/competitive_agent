import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Website() {
  const [loading, setLoading] = useState(false);
  const [websiteStatus, setWebsiteStatus] = useState(null);
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [content, setContent] = useState(null);
  const [pageName, setPageName] = useState('');

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/website/status`);
      setWebsiteStatus(response.data);
      toast.success('Website status checked!');
    } catch (error) {
      toast.error('Failed to check website');
    }
    setLoading(false);
  };

  const analyzeSEO = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/website/seo-analysis`);
      setSeoAnalysis(response.data);
      toast.success('SEO analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze SEO');
    }
    setLoading(false);
  };

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/website/generate-content`, {
        page: pageName
      });
      setContent(response.data);
      toast.success('Website content generated!');
    } catch (error) {
      toast.error('Failed to generate content');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Website Manager</h1>
        <p className="text-gray-500 mt-1">Monitor, optimize, and maintain your website</p>
      </div>

      {/* Website Status */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-6 h-6" />
            <span>Website Status & Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {websiteStatus ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  {websiteStatus.status === 'online' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <Badge variant={websiteStatus.status === 'online' ? 'default' : 'destructive'}>
                    {websiteStatus.status}
                  </Badge>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Response Time</p>
                <p className="text-xl font-bold">{websiteStatus.response_time_ms}ms</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Last Checked</p>
                <p className="text-sm">{new Date(websiteStatus.checked_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Checking website status...</p>
            </div>
          )}
          <Button onClick={checkStatus} disabled={loading} className="w-full mt-4">
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SEO Analysis */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardTitle>SEO Analysis</CardTitle>
            <CardDescription className="text-blue-100">
              AI-powered SEO recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button onClick={analyzeSEO} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze SEO
            </Button>
            {seoAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">SEO Recommendations</h3>
                <div className="whitespace-pre-wrap text-sm text-gray-800">{seoAnalysis.analysis}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Generation */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle>Content Generation</CardTitle>
            <CardDescription className="text-purple-100">
              AI creates SEO-optimized page content
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label>Page Name</Label>
              <Input
                placeholder="e.g., About Us, Services, Contact"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
            <Button onClick={generateContent} disabled={loading || !pageName} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Content
            </Button>
            {content && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Generated Content for: {content.page}</h3>
                <div className="whitespace-pre-wrap text-sm text-gray-800 max-h-64 overflow-y-auto">
                  {content.content}
                </div>
                <Button variant="outline" className="w-full mt-2">Copy Content</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">Uptime Monitoring</div>
              <div className="text-sm text-gray-500 mt-1">
                24/7 website availability tracking
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">SEO Optimization</div>
              <div className="text-sm text-gray-500 mt-1">
                AI-powered search engine optimization
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Globe className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">Performance</div>
              <div className="text-sm text-gray-500 mt-1">
                Real-time speed and response monitoring
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
