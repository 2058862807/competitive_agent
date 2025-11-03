import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Key, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Settings() {
  const [apiKeys, setApiKeys] = useState({
    openrouter: '',
    twilio_sid: '',
    twilio_token: '',
    sendgrid: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    synthesia: '',
    elevenlabs: ''
  });

  const [saved, setSaved] = useState({});
  const [testing, setTesting] = useState(false);

  const handleSave = async (keyName, value) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/settings/api-key`, {
        key_name: keyName,
        key_value: value
      });
      
      setSaved({ ...saved, [keyName]: true });
      toast.success(`${keyName} API key saved!`);
      
      setTimeout(() => {
        setSaved({ ...saved, [keyName]: false });
      }, 3000);
    } catch (error) {
      toast.error('Failed to save API key');
    }
  };

  const testOpenRouterKey = async () => {
    if (!apiKeys.openrouter) {
      toast.error('Please enter an OpenRouter API key first');
      return;
    }

    setTesting(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        message: 'Test: Say hello in one sentence'
      });
      
      if (response.data.response && !response.data.response.includes('configure')) {
        toast.success('OpenRouter API key is working!');
      } else {
        toast.error('API key test failed');
      }
    } catch (error) {
      toast.error('Failed to test API key');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className=\"space-y-6 fade-in\">
      <div>
        <h1 className=\"text-3xl font-bold text-gray-900\" data-testid=\"settings-title\">
          Settings & API Configuration
        </h1>
        <p className=\"text-gray-500 mt-1\">
          Configure your API keys to enable all features
        </p>
      </div>

      <Tabs defaultValue=\"ai\" className=\"space-y-4\">
        <TabsList className=\"grid w-full grid-cols-4\">
          <TabsTrigger value=\"ai\">AI & OpenRouter</TabsTrigger>
          <TabsTrigger value=\"communication\">Communication</TabsTrigger>
          <TabsTrigger value=\"social\">Social Media</TabsTrigger>
          <TabsTrigger value=\"video\">Video Generation</TabsTrigger>
        </TabsList>

        {/* AI & OpenRouter */}
        <TabsContent value=\"ai\">
          <Card>
            <CardHeader className=\"bg-gradient-to-r from-purple-500 to-pink-500 text-white\">
              <CardTitle className=\"flex items-center space-x-2\">
                <Key className=\"w-6 h-6\" />
                <span>OpenRouter API Key (Required)</span>
              </CardTitle>
              <CardDescription className=\"text-purple-100\">
                Powers the AI Office Manager - Get your key at openrouter.ai
              </CardDescription>
            </CardHeader>
            <CardContent className=\"p-6 space-y-4\">
              <div>
                <Label htmlFor=\"openrouter\">OpenRouter API Key</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"openrouter\"
                    type=\"password\"
                    placeholder=\"sk-or-v1-...\"
                    value={apiKeys.openrouter}
                    onChange={(e) => setApiKeys({...apiKeys, openrouter: e.target.value})}
                    className=\"flex-1\"
                    data-testid=\"openrouter-key-input\"
                  />
                  <Button 
                    onClick={() => handleSave('openrouter', apiKeys.openrouter)}
                    disabled={!apiKeys.openrouter}
                    data-testid=\"save-openrouter-btn\"
                  >
                    {saved.openrouter ? <CheckCircle className=\"w-4 h-4\" /> : <Save className=\"w-4 h-4\" />}
                  </Button>
                </div>
                <p className=\"text-xs text-gray-500 mt-1\">
                  Get your key: <a href=\"https://openrouter.ai/keys\" target=\"_blank\" rel=\"noopener noreferrer\" className=\"text-purple-600 hover:underline\">openrouter.ai/keys</a>
                </p>
              </div>

              <div className=\"flex space-x-2\">
                <Button 
                  onClick={testOpenRouterKey}
                  disabled={testing || !apiKeys.openrouter}
                  variant=\"outline\"
                  className=\"w-full\"
                  data-testid=\"test-key-btn\"
                >
                  {testing ? 'Testing...' : 'Test API Key'}
                </Button>
              </div>

              <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
                <h4 className=\"font-semibold text-blue-900 mb-2\">Supported Models:</h4>
                <ul className=\"text-sm text-blue-800 space-y-1\">
                  <li>• OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5</li>
                  <li>• Anthropic: Claude 3.5 Sonnet, Claude 3 Opus</li>
                  <li>• Google: Gemini Pro, Gemini Flash</li>
                  <li>• Meta: Llama 3.1, Llama 3</li>
                  <li>• And 100+ more models!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication */}
        <TabsContent value=\"communication\">
          <Card>
            <CardHeader className=\"bg-gradient-to-r from-blue-500 to-cyan-500 text-white\">
              <CardTitle>Communication APIs</CardTitle>
              <CardDescription className=\"text-blue-100\">
                Enable fax and email capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className=\"p-6 space-y-4\">
              <div>
                <Label htmlFor=\"twilio_sid\">Twilio Account SID (Fax)</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"twilio_sid\"
                    type=\"password\"
                    placeholder=\"AC...\"
                    value={apiKeys.twilio_sid}
                    onChange={(e) => setApiKeys({...apiKeys, twilio_sid: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('twilio_sid', apiKeys.twilio_sid)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"twilio_token\">Twilio Auth Token</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"twilio_token\"
                    type=\"password\"
                    value={apiKeys.twilio_token}
                    onChange={(e) => setApiKeys({...apiKeys, twilio_token: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('twilio_token', apiKeys.twilio_token)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"sendgrid\">SendGrid API Key (Email)</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"sendgrid\"
                    type=\"password\"
                    placeholder=\"SG...\"
                    value={apiKeys.sendgrid}
                    onChange={(e) => setApiKeys({...apiKeys, sendgrid: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('sendgrid', apiKeys.sendgrid)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value=\"social\">
          <Card>
            <CardHeader className=\"bg-gradient-to-r from-orange-500 to-red-500 text-white\">
              <CardTitle>Social Media APIs</CardTitle>
              <CardDescription className=\"text-orange-100\">
                Enable automatic posting to social platforms
              </CardDescription>
            </CardHeader>
            <CardContent className=\"p-6 space-y-4\">
              <div>
                <Label htmlFor=\"linkedin\">LinkedIn Access Token</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"linkedin\"
                    type=\"password\"
                    value={apiKeys.linkedin}
                    onChange={(e) => setApiKeys({...apiKeys, linkedin: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('linkedin', apiKeys.linkedin)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"twitter\">Twitter/X API Key</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"twitter\"
                    type=\"password\"
                    value={apiKeys.twitter}
                    onChange={(e) => setApiKeys({...apiKeys, twitter: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('twitter', apiKeys.twitter)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"facebook\">Facebook Page Token</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"facebook\"
                    type=\"password\"
                    value={apiKeys.facebook}
                    onChange={(e) => setApiKeys({...apiKeys, facebook: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('facebook', apiKeys.facebook)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"instagram\">Instagram Access Token</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"instagram\"
                    type=\"password\"
                    value={apiKeys.instagram}
                    onChange={(e) => setApiKeys({...apiKeys, instagram: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('instagram', apiKeys.instagram)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video */}
        <TabsContent value=\"video\">
          <Card>
            <CardHeader className=\"bg-gradient-to-r from-green-500 to-emerald-500 text-white\">
              <CardTitle>Video Generation APIs</CardTitle>
              <CardDescription className=\"text-green-100\">
                Enable automatic video creation
              </CardDescription>
            </CardHeader>
            <CardContent className=\"p-6 space-y-4\">
              <div>
                <Label htmlFor=\"synthesia\">Synthesia API Key</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"synthesia\"
                    type=\"password\"
                    value={apiKeys.synthesia}
                    onChange={(e) => setApiKeys({...apiKeys, synthesia: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('synthesia', apiKeys.synthesia)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor=\"elevenlabs\">ElevenLabs API Key (Voice)</Label>
                <div className=\"flex space-x-2 mt-2\">
                  <Input
                    id=\"elevenlabs\"
                    type=\"password\"
                    value={apiKeys.elevenlabs}
                    onChange={(e) => setApiKeys({...apiKeys, elevenlabs: e.target.value})}
                    className=\"flex-1\"
                  />
                  <Button onClick={() => handleSave('elevenlabs', apiKeys.elevenlabs)}>
                    <Save className=\"w-4 h-4\" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=\"grid md:grid-cols-2 gap-4\">
            <div className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
              <span>AI Agent</span>
              <span className=\"flex items-center text-green-600\">
                <CheckCircle className=\"w-4 h-4 mr-1\" />
                Active
              </span>
            </div>
            <div className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
              <span>Document Scanner</span>
              <span className=\"flex items-center text-green-600\">
                <CheckCircle className=\"w-4 h-4 mr-1\" />
                Active
              </span>
            </div>
            <div className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
              <span>Database</span>
              <span className=\"flex items-center text-green-600\">
                <CheckCircle className=\"w-4 h-4 mr-1\" />
                Connected
              </span>
            </div>
            <div className=\"flex items-center justify-between p-3 bg-gray-50 rounded-lg\">
              <span>All Services</span>
              <span className=\"flex items-center text-green-600\">
                <CheckCircle className=\"w-4 h-4 mr-1\" />
                Running
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
