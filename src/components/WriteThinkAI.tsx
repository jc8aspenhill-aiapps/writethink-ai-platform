'use client';

import React, { useState } from 'react';
import { Lightbulb, MessageSquare, Target, List, BookOpen, Brain, Pencil, Eye, AlertCircle, Download } from 'lucide-react';
import { exportToWordDocument } from '@/utils/exportUtils';

interface Phase {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ThinkingPrompts {
  whatDoYouBelieve: string;
  whyDoesItMatter: string;
  whatIsTheDebate: string;
}

interface ArgumentPoint {
  suggestedFocus: string;
  developmentQuestions: string[];
}

interface ArgumentStructure {
  introduction: {
    purpose: string;
    questions: string[];
  };
  bodyPoints: ArgumentPoint[];
  conclusion: {
    purpose: string;
    questions: string[];
  };
}

interface DevelopmentData {
  clarifyingQuestions: string[];
  thinkingPrompts: ThinkingPrompts;
  argumentStructure: ArgumentStructure;
  nextSteps: string[];
}

const WriteThinkAI: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [thesisOrClaim, setThesisOrClaim] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<string>('input');
  const [developmentData, setDevelopmentData] = useState<DevelopmentData | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [writingProgress, setWritingProgress] = useState<Record<string, any>>({});

  const phases: Phase[] = [
    { id: 'input', label: 'Topic', icon: Target },
    { id: 'develop', label: 'Develop Thinking', icon: Brain },
    { id: 'structure', label: 'Organize', icon: List },
    { id: 'refine', label: 'Strengthen Logic', icon: Lightbulb },
    { id: 'voice', label: 'Your Voice', icon: Pencil }
  ];

  const startDevelopment = async () => {
    if (!topic || !thesisOrClaim) return;
    
    setLoading(true);
    
    const prompt = `You are a writing coach helping a student develop a clear, logical argument. The student wants to write about: "${topic}"

Their initial thesis/claim is: "${thesisOrClaim}"

Your role is to help them THINK about their argument, NOT to write for them. Generate a structured development plan in JSON format:

{
  "clarifyingQuestions": [
    "question that helps them define their position more clearly",
    "question about their audience and purpose", 
    "question about what they already know about the topic"
  ],
  "thinkingPrompts": {
    "whatDoYouBelieve": "Prompt asking them to explain their position in their own words",
    "whyDoesItMatter": "Prompt about the significance of their argument",
    "whatIsTheDebate": "Prompt about different perspectives on this topic"
  },
  "argumentStructure": {
    "introduction": {
      "purpose": "What an introduction needs to do",
      "questions": ["Question to help them think about opening", "Question about hooking readers"]
    },
    "bodyPoints": [
      {
        "suggestedFocus": "A possible main point (not written for them)",
        "developmentQuestions": ["Question about evidence", "Question about counterarguments"]
      }
    ],
    "conclusion": {
      "purpose": "What a conclusion should accomplish",
      "questions": ["Question about significance", "Question about implications"]
    }
  },
  "nextSteps": [
    "Specific actionable step for developing their thinking",
    "Another step that helps them move forward"
  ]
}

Remember: Your job is to guide their thinking process, not to provide answers or write content for them.`;

    try {
      // Use different endpoints for development vs production
      // In development (localhost), use trailing slash for Next.js API routes
      // In production (Cloudflare), use no trailing slash for Cloudflare Functions
      const apiEndpoint = window.location.hostname === 'localhost' ? '/api/claude/' : '/api/claude';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: prompt,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const data = await response.json();
      const parsedData = JSON.parse(data.content);
      setDevelopmentData(parsedData);
      setCurrentPhase('develop');
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error starting the development. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!userMessage.trim()) return;

    const newMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newMessage]);
    setUserMessage('');
    setLoading(true);

    const conversationContext = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = `You are a writing coach in a conversation with a student. Your role is to guide their thinking through questions and prompts, NOT to provide answers or write content for them.

Context:
Topic: ${topic}
Their thesis/claim: ${thesisOrClaim}

Previous conversation:
${conversationContext}

Student just said: "${userMessage}"

Respond as a coach would - with thoughtful questions, encouragement to think deeper, or prompts that help them discover their own insights. Keep it conversational but focused on their learning process.`;

    try {
      // Use different endpoints for development vs production
      // In development (localhost), use trailing slash for Next.js API routes
      // In production (Cloudflare), use no trailing slash for Cloudflare Functions
      const apiEndpoint = window.location.hostname === 'localhost' ? '/api/claude/' : '/api/claude';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: prompt,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Claude');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.content };
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'I had trouble responding. Could you try asking that again?' 
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const saveNoteForSection = (sectionKey: string, note: string) => {
    setStudentNotes(prev => ({
      ...prev,
      [sectionKey]: note
    }));
  };

  const handleExportDocument = async () => {
    if (!topic || Object.keys(studentNotes).length === 0) {
      alert('Please complete some sections before exporting.');
      return;
    }

    setLoading(true);
    try {
      await exportToWordDocument({
        topic,
        thesisOrClaim,
        studentNotes,
        chatHistory,
        developmentData
      });
      
      // Show success message
      alert('Your thinking worksheet has been downloaded as a Word document!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">What do you want to think about?</h2>
              <p className="text-slate-600">Start by telling me your topic and initial thoughts.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your topic or question:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Should college be free? Climate change effects on agriculture..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-indigo-400 focus:outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your initial thesis, claim, or position:
                </label>
                <textarea
                  value={thesisOrClaim}
                  onChange={(e) => setThesisOrClaim(e.target.value)}
                  placeholder="What do you think about this topic? What's your initial position or argument?"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-indigo-400 focus:outline-none text-slate-800 h-24 resize-none"
                />
              </div>

              <button
                onClick={startDevelopment}
                disabled={!topic || !thesisOrClaim || loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Developing your thinking...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Start Developing Your Thinking
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'develop':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Let's develop your thinking</h2>
              <p className="text-slate-600">Work through these questions and prompts to clarify your argument.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Clarifying Questions
                </h3>
                <div className="space-y-3">
                  {developmentData?.clarifyingQuestions.map((question, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-900 text-sm mb-2">{question}</p>
                      <textarea
                        placeholder="Your thoughts..."
                        className="w-full px-3 py-2 border border-blue-200 rounded text-sm focus:border-blue-400 focus:outline-none"
                        onChange={(e) => saveNoteForSection(`clarifying-${idx}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Thinking Prompts
                </h3>
                <div className="space-y-3">
                  {developmentData && Object.entries(developmentData.thinkingPrompts).map(([key, prompt], idx) => (
                    <div key={key} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-purple-900 text-sm mb-2">{prompt}</p>
                      <textarea
                        placeholder="Write your thoughts..."
                        className="w-full px-3 py-2 border border-purple-200 rounded text-sm focus:border-purple-400 focus:outline-none"
                        onChange={(e) => saveNoteForSection(`thinking-${key}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-green-600" />
                Argument Structure
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Introduction</h4>
                  <p className="text-green-800 text-sm mb-3">{developmentData?.argumentStructure.introduction.purpose}</p>
                  {developmentData?.argumentStructure.introduction.questions.map((question, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="text-green-900 text-xs mb-1">{question}</p>
                      <textarea
                        placeholder="Your ideas..."
                        className="w-full px-2 py-1 border border-green-200 rounded text-xs"
                        onChange={(e) => saveNoteForSection(`intro-${idx}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">Body Points</h4>
                  {developmentData?.argumentStructure.bodyPoints.map((point, pointIdx) => (
                    <div key={pointIdx} className="mb-4">
                      <p className="text-amber-800 text-sm mb-2">{point.suggestedFocus}</p>
                      {point.developmentQuestions.map((question, qIdx) => (
                        <div key={qIdx} className="mb-2">
                          <p className="text-amber-900 text-xs mb-1">{question}</p>
                          <textarea
                            placeholder="Your thoughts..."
                            className="w-full px-2 py-1 border border-amber-200 rounded text-xs"
                            onChange={(e) => saveNoteForSection(`body-${pointIdx}-${qIdx}`, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Conclusion</h4>
                  <p className="text-red-800 text-sm mb-3">{developmentData?.argumentStructure.conclusion.purpose}</p>
                  {developmentData?.argumentStructure.conclusion.questions.map((question, idx) => (
                    <div key={idx} className="mb-2">
                      <p className="text-red-900 text-xs mb-1">{question}</p>
                      <textarea
                        placeholder="Your ideas..."
                        className="w-full px-2 py-1 border border-red-200 rounded text-xs"
                        onChange={(e) => saveNoteForSection(`conclusion-${idx}`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPhase('structure')}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <List className="w-5 h-5" />
                Move to Structure Phase
              </button>
              
              {Object.keys(studentNotes).length > 0 && (
                <button
                  onClick={handleExportDocument}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Progress
                </button>
              )}
            </div>
          </div>
        );

      case 'structure':
      case 'refine':
      case 'voice':
        return (
          <div className="text-center py-12">
            <div className="bg-blue-50 p-6 rounded-xl inline-block">
              <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-blue-900 mb-2">Phase: {phases.find(p => p.id === currentPhase)?.label}</h3>
              <p className="text-blue-800 text-sm">This phase is coming soon! For now, continue developing your ideas in the chat below.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">WriteThink AI</h1>
          <p className="text-slate-600">Your thinking partner for stronger arguments</p>
          <p className="text-sm text-slate-500 mt-2">
            Designed by{' '}
            <a 
              href="https://lemiscatemind.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Lemiscatemind.com
            </a>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === currentPhase;
              const isCompleted = phases.findIndex(p => p.id === currentPhase) > index;
              
              return (
                <div key={phase.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {phase.label}
                  </span>
                  {index < phases.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-300' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {renderPhase()}
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Chat with Your Coach</h3>
              </div>

              <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                <p className="text-indigo-900 text-sm font-medium">I'm here to help you think!</p>
                <p className="text-xs">Ask me questions about your argument, and I'll guide you with questions back.</p>
              </div>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-100 text-blue-900 ml-4'
                        : 'bg-slate-100 text-slate-800 mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  placeholder="Ask for help thinking..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
                />
                <button
                  onClick={handleChat}
                  disabled={!userMessage.trim() || loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                >
                  Ask
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">Your Notes</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  {Object.entries(studentNotes).map(([key, value]) => (
                    <div key={key} className="bg-slate-50 p-2 rounded">
                      <span className="font-semibold capitalize">{key}:</span> {value.substring(0, 50)}...
                    </div>
                  ))}
                  {Object.keys(studentNotes).length === 0 && (
                    <p className="text-slate-500 italic">No notes yet. Start filling in the sections!</p>
                  )}
                </div>
                
                {/* Export Button */}
                {(Object.keys(studentNotes).length > 0 || chatHistory.length > 0) && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={handleExportDocument}
                      disabled={loading}
                      className="w-full py-2 px-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Export to Word
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-500 mt-1 text-center">
                      Download your thinking process as a Word document
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="text-center text-sm text-slate-500">
            <p>
              WriteThink AI Platform - Designed by{' '}
              <a 
                href="https://lemiscatemind.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Lemiscatemind.com
              </a>
            </p>
            <p className="mt-1 text-xs">
              Educational technology for critical thinking and writing development
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteThinkAI;