import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { sendChatMessage, getChatHistory } from '@/api';
import { Send, Bot, User, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    loadHistory();
    initializeSpeech();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeech = () => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    }
  };

  const speakText = (text) => {
    if (!synthRef.current || !voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a good quality voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.name.includes('Samantha') ||
      voice.name.includes('Alex')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
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
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        metadata: {
          score: data.score,
          model: data.model,
          confidence: data.confidence,
          processing_time: data.processing_time
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Speak the response if voice is enabled
      if (voiceEnabled && data.response) {
        speakText(data.response);
      }
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
        <h1 className="text-3xl font-bold text-gray-900" data-testid="ai-chat-title">AI Office Manager</h1>
        <p className="text-gray-500 mt-1">Voice & text chat with your intelligent assistant</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6" />
              <span>AI Office Manager</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={voiceEnabled ? "secondary" : "outline"}
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) stopSpeaking();
                  toast.success(voiceEnabled ? 'Voice disabled' : 'Voice enabled');
                }}
                className="bg-white/20 hover:bg-white/30"
                data-testid="voice-toggle-btn"
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Speak or type - Powered by OpenRouter with voice capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50" data-testid="chat-messages-container">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Bot className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Type or click the microphone to speak</p>
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
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
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
                      {voiceEnabled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speakText(message.content)}
                          className="h-6 px-2"
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
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
              <Button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                variant={isListening ? "default" : "outline"}
                className={isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
                data-testid="voice-input-btn"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type your message or click mic to speak..."}
                disabled={loading || isListening}
                className="flex-1"
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim() || isListening}
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
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isListening ? '🎤 Listening... Speak now' : 'Click mic to speak or type your message'}
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Voice Features Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Mic className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">Speech-to-Text</div>
              <div className="text-sm text-gray-500 mt-1">Speak naturally to the AI</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Volume2 className="w-12 h-12 mx-auto mb-2 text-pink-500" />
              <div className="text-xl font-bold">Text-to-Speech</div>
              <div className="text-sm text-gray-500 mt-1">AI responds with voice</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-2 text-indigo-500" />
              <div className="text-xl font-bold">Hands-Free</div>
              <div className="text-sm text-gray-500 mt-1">Complete voice conversation</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
