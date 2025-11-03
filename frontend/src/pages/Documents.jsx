import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Documents() {
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadedDoc(null);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/documents/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadedDoc(response.data.analysis);
      toast.success('Document processed successfully!');
    } catch (error) {
      toast.error('Failed to process document');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="documents-title">
          Document Scanner & AI Analyzer
        </h1>
        <p className="text-gray-500 mt-1">
          Upload any document for AI-powered analysis and processing
        </p>
      </div>

      {/* Upload Area */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>Upload Document</span>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Supports PDF, Word, Images (OCR), and Text files
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            data-testid="upload-area"
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <p className="text-lg text-gray-700">Processing document...</p>
                <p className="text-sm text-gray-500">AI is analyzing your document</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <FileText className="w-16 h-16 text-gray-400" />
                <p className="text-lg font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOCX, PNG, JPG, TXT (Max 50MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
              onChange={handleFileSelect}
              data-testid="file-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {uploadedDoc && (
        <Card className="shadow-lg border-green-200 border-2" data-testid="analysis-results">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6" />
              <span>AI Analysis Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Document Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Filename</p>
                <p className="font-medium truncate" data-testid="doc-filename">{uploadedDoc.filename}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Type</p>
                <Badge variant="outline" data-testid="doc-type">{uploadedDoc.file_type}</Badge>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Word Count</p>
                <p className="font-medium" data-testid="doc-words">{uploadedDoc.word_count}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Analysis Score</p>
                <Badge className="bg-green-500" data-testid="doc-score">
                  {uploadedDoc.analysis_score?.toFixed(1)}/10
                </Badge>
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                AI Analysis
              </h3>
              <div
                className="bg-white border border-gray-200 rounded-lg p-4 whitespace-pre-wrap"
                data-testid="ai-analysis-content"
              >
                {uploadedDoc.ai_analysis}
              </div>
            </div>

            {/* Extracted Text Preview */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Extracted Text (Preview)</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap" data-testid="extracted-text">
                  {uploadedDoc.text_content?.substring(0, 1000)}
                  {uploadedDoc.text_content?.length > 1000 && '...'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4">
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
                data-testid="forward-to-ai-btn"
              >
                Forward to AI Agent
              </Button>
              <Button variant="outline" data-testid="download-analysis-btn">Download Analysis</Button>
              <Button variant="outline" onClick={() => setUploadedDoc(null)} data-testid="clear-btn">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 text-blue-500" />
              <div className="text-xl font-bold">Smart OCR</div>
              <div className="text-sm text-gray-500 mt-1">
                Extract text from images and scanned documents
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <div className="text-xl font-bold">AI Analysis</div>
              <div className="text-sm text-gray-500 mt-1">
                Automatic categorization and key information extraction
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-purple-500" />
              <div className="text-xl font-bold">Multi-Format</div>
              <div className="text-sm text-gray-500 mt-1">
                Support for PDF, Word, images, and text files
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
