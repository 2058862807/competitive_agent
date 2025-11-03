import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Inbox } from 'lucide-react';

export default function MailAssistant() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="mail-assistant-title">Mail Assistant</h1>
        <p className="text-gray-500 mt-1">AI-powered email management and composition</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-6 h-6" />
            <span>Mail Assistant</span>
          </CardTitle>
          <CardDescription className="text-green-100">
            Smart email composition and management
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mail Assistant Feature</h3>
            <p className="text-gray-500 mb-4">AI-powered email drafting, response suggestions, and inbox management.</p>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
