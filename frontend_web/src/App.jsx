import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MainChat from './components/MainChat';
import ChatInput from './components/ChatInput';
import PDFViewer from './components/PDFViewer';
import InsightsPanel from './components/InsightsPanel';
import QuizMode from './components/QuizMode';
import MindMap from './components/MindMap';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-red-400 font-semibold mb-2">Something went wrong</p>
            <p className="text-xs text-slate-500 font-mono">{this.state.error.message}</p>
            <button onClick={() => this.setState({ error: null })}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500">
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [grade, setGrade] = useState(10);

  // Insights
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Quiz
  const [quiz, setQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState('');

  // Mind Map
  const [mindmap, setMindmap] = useState(null);
  const [isLoadingMindmap, setIsLoadingMindmap] = useState(false);

  // Suggested prompt prefill
  const [prefill, setPrefill] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setInsights(null);
    setQuiz(null);
    setQuizError('');
    setMessages([]);

    const formData = new FormData();
    formData.append('file', file);
    const fileUrl = URL.createObjectURL(file);
    setActivePdfUrl(fileUrl);
    setActivePage(1);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.message) {
        setUploadedDoc({
          filename: response.data.filename,
          pages: response.data.pages,
          size: response.data.size,
        });
        // Auto-fetch insights
        fetchInsights();
      }
    } catch (error) {
      setMessages([{ role: 'assistant', content: `**Error:** Failed to upload. ${error.response?.data?.error || error.message}` }]);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/insights`);
      if (!res.data.error) setInsights(res.data);
    } catch (_) {}
    finally { setIsLoadingInsights(false); }
  };

  const handleGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setQuiz(null);
    setQuizError('');
    setActiveTab('quiz');
    try {
      const res = await axios.get(`${API_BASE_URL}/quiz`, { params: { grade, num_questions: 5 } });
      if (res.data.error) {
        setQuizError(res.data.error);
      } else if (!res.data.questions || res.data.questions.length === 0) {
        setQuizError('No quiz questions were generated. Try again after re-uploading the document.');
      } else {
        setQuiz(res.data);
      }
    } catch (error) {
      setQuizError(error.response?.data?.error || error.message || 'Failed to generate quiz.');
    }
    finally { setIsLoadingQuiz(false); }
  };

  const handleGenerateMindmap = async () => {
    setIsLoadingMindmap(true);
    setMindmap(null);
    setActiveTab('mindmap');
    try {
      const res = await axios.get(`${API_BASE_URL}/mindmap`);
      if (!res.data.error) setMindmap(res.data);
    } catch (_) {}
    finally { setIsLoadingMindmap(false); }
  };

  const handleSendMessage = async (text) => {
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsGenerating(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ask`, { params: { question: text, grade } });
      if (response.data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${response.data.error}` }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.answer,
          citations: response.data.citations,
          grade,
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${error.response?.data?.error || error.message}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans selection:bg-indigo-500/30" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Sidebar
        isUploading={isUploading}
        uploadedDoc={uploadedDoc}
        onFileUpload={handleFileUpload}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content — full width on mobile */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          grade={grade}
          onGradeChange={setGrade}
          onGenerateQuiz={handleGenerateQuiz}
          onGenerateMindMap={handleGenerateMindmap}
          hasDocument={!!uploadedDoc}
          isSummarizing={isLoadingQuiz}
          isMindMapping={isLoadingMindmap}
          onMenuOpen={() => setMobileMenuOpen(true)}
        />

        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {(insights || isLoadingInsights) && (
              <InsightsPanel insights={insights} isLoading={isLoadingInsights} />
            )}

            {activeTab === 'chat' ? (
              <>
                <MainChat
                  messages={messages}
                  isGenerating={isGenerating}
                  onCitationClick={(page) => setActivePage(page)}
                  onSuggestedPrompt={(text) => setPrefill(text)}
                  hasDocument={!!uploadedDoc}
                />
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  prefill={prefill}
                  onPrefillConsumed={() => setPrefill('')}
                />
              </>
            ) : activeTab === 'quiz' ? (
              <ErrorBoundary>
                <QuizMode
                  quiz={quiz}
                  isLoading={isLoadingQuiz}
                  error={quizError}
                  onRegenerate={handleGenerateQuiz}
                  grade={grade}
                  hasDocument={!!uploadedDoc}
                />
              </ErrorBoundary>
            ) : (
              <ErrorBoundary>
                <MindMap
                  mindmap={mindmap}
                  isLoading={isLoadingMindmap}
                  onGenerate={handleGenerateMindmap}
                  hasDocument={!!uploadedDoc}
                />
              </ErrorBoundary>
            )}
          </div>

          {/* PDF viewer — desktop only */}
          <PDFViewer
            pdfUrl={activePdfUrl}
            activePage={activePage}
            onClose={() => { setActivePdfUrl(null); setActivePage(null); }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
