import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare } from 'lucide-react';

export default function EmailHelper() {
  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="email-helper-title">Email Helper</h1>
        <p className="text-gray-500 mt-1">Intelligent email assistance and automation</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-6 h-6" />
            <span>Email Helper</span>
          </CardTitle>
          <CardDescription className="text-orange-100">
            Automated email workflows and templates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Helper Feature</h3>
            <p className="text-gray-500 mb-4">Automated email templates, scheduling, and intelligent follow-ups.</p>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
