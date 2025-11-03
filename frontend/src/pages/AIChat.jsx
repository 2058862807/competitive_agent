import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { sendChatMessage, getChatHistory } from '@/api';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await getChatHistory();
      const history = response.data.map(msg => ([
        { role: 'user', content: msg.message },
        { role: 'assistant', content: msg.response, metadata: msg }
      ])).flat().reverse();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage);
      const data = response.data;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        metadata: {
          score: data.score,
          model: data.model,
          confidence: data.confidence,
          processing_time: data.processing_time
        }
      }]);
    } catch (error) {
      toast.error('Failed to get AI response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { confidence: 'none' }
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="ai-chat-title">AI Agent Chat</h1>
        <p className="text-gray-500 mt-1">Interact with the self-learning AI agent powered by OpenRouter</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <span>Self-Learning AI Agent</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Competitive multi-model AI with peer review system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50" data-testid="chat-messages-container">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bot className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Start a conversation with the AI Agent</p>
                <p className="text-sm">Ask anything - the agent will generate competitive responses!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`chat-message-${index}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : 'order-2'}`}>
                  <div
                    className={`p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.metadata && message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      {message.metadata.score !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          Score: {message.metadata.score.toFixed(1)}/10
                        </Badge>
                      )}
                      {message.metadata.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {message.metadata.confidence}
                        </Badge>
                      )}
                      {message.metadata.model && (
                        <Badge variant="outline" className="text-xs">
                          {message.metadata.model}
                        </Badge>
                      )}
                      {message.metadata.processing_time && (
                        <span className="text-xs">
                          {message.metadata.processing_time.toFixed(2)}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg"
                data-testid="chat-send-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Multi-Model</div>
              <div className="text-sm text-gray-500 mt-1">Competitive generation from multiple AI models</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">Peer Review</div>
              <div className="text-sm text-gray-500 mt-1">Each response is reviewed and improved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">Self-Learning</div>
              <div className="text-sm text-gray-500 mt-1">Agent learns from successful interactions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
