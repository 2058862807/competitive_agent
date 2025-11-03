import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Communication() {
  const [loading, setLoading] = useState(false);
  const [emailReply, setEmailReply] = useState('');
  const [faxData, setFaxData] = useState({ to_number: '', document_id: '' });
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [originalEmail, setOriginalEmail] = useState('');

  const handleSendFax = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/communication/fax`, faxData);
      toast.success(response.data.message || 'Fax sent successfully');
    } catch (error) {
      toast.error('Failed to send fax');
    }
    setLoading(false);
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/communication/email`, emailData);
      toast.success(response.data.message || 'Email sent successfully');
    } catch (error) {
      toast.error('Failed to send email');
    }
    setLoading(false);
  };

  const handleGenerateReply = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/communication/email/reply`, {
        original_email: originalEmail
      });
      setEmailReply(response.data.reply);
      toast.success('AI reply generated!');
    } catch (error) {
      toast.error('Failed to generate reply');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Communication Hub</h1>
        <p className="text-gray-500 mt-1">Fax, Email, and AI-powered replies</p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email">Send Email</TabsTrigger>
          <TabsTrigger value="fax">Send Fax</TabsTrigger>
          <TabsTrigger value="ai-reply">AI Email Reply</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-6 h-6" />
                <span>Send Email</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>To</Label>
                <Input
                  placeholder="recipient@example.com"
                  value={emailData.to}
                  onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  rows={6}
                  placeholder="Email body"
                  value={emailData.body}
                  onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                />
              </div>
              <Button onClick={handleSendEmail} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fax">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle>Send Fax</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Fax Number</Label>
                <Input
                  placeholder="+1234567890"
                  value={faxData.to_number}
                  onChange={(e) => setFaxData({...faxData, to_number: e.target.value})}
                />
              </div>
              <div>
                <Label>Document ID</Label>
                <Input
                  placeholder="Upload document first to get ID"
                  value={faxData.document_id}
                  onChange={(e) => setFaxData({...faxData, document_id: e.target.value})}
                />
              </div>
              <Button onClick={handleSendFax} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Fax
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-reply">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6" />
                <span>AI Email Reply Generator</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Original Email</Label>
                <Textarea
                  rows={6}
                  placeholder="Paste the email you want to reply to..."
                  value={originalEmail}
                  onChange={(e) => setOriginalEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleGenerateReply} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate AI Reply
              </Button>
              {emailReply && (
                <div className="mt-4">
                  <Label>AI Generated Reply</Label>
                  <div className="bg-gray-50 border rounded-lg p-4 mt-2">
                    <p className="whitespace-pre-wrap">{emailReply}</p>
                  </div>
                  <Button variant="outline" className="w-full mt-2">Copy Reply</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
