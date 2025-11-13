'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Code2, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sql?: string;
  results?: any[];
  error?: string;
}

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat-with-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: currentInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process query');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.text || 'Query executed successfully',
        sql: data.sql,
        results: data.results || [],
        error: data.error,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Failed to process your query',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (results: any[]) => {
    if (!results || results.length === 0) return null;

    const keys = Object.keys(results[0]);
    const hasNumericData = keys.some(key => 
      typeof results[0][key] === 'number'
    );

    if (!hasNumericData) return null;

    // Find numeric column
    const numericKey = keys.find(key => typeof results[0][key] === 'number') || '';
    const labelKey = keys.find(key => typeof results[0][key] === 'string') || keys[0];

    // If we have categorical data with numbers, show pie chart
    if (results.length <= 10 && labelKey && numericKey) {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Visual Representation</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={results}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry[labelKey]}: ${entry[numericKey]}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={numericKey}
              >
                {results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Bar chart for other numeric data
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">Visual Representation</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={labelKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={numericKey} fill="#1E3A8A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderResults = (message: ChatMessage) => {
    if (!message.results || message.results.length === 0) {
      return <p className="text-sm text-gray-500 mt-2">No results found</p>;
    }

    const columns = Object.keys(message.results[0]);

    return (
      <>
        {/* Results Table */}
        <div className="mt-4 overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((col) => (
                  <TableHead key={col} className="font-semibold text-gray-700">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {message.results.slice(0, 10).map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col} className="text-sm">
                      {typeof row[col] === 'number'
                        ? row[col].toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : typeof row[col] === 'object' && row[col] !== null
                        ? JSON.stringify(row[col])
                        : String(row[col] || '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {message.results.length > 10 && (
            <div className="p-2 text-center text-sm text-gray-500 bg-gray-50 border-t">
              Showing 10 of {message.results.length} results
            </div>
          )}
        </div>

        {/* Optional Chart */}
        {renderChart(message.results)}
      </>
    );
  };

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat with Data</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your invoice data in natural language
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">AI Assistant</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Natural language to SQL with instant results
            </p>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="space-y-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center text-gray-500">
                    <p className="mb-4 font-medium text-gray-900">Try These Questions:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setInput("What's the total spend?")}
                        className="block w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-left text-sm transition-colors"
                      >
                        💰 "What's the total spend?"
                      </button>
                      <button
                        onClick={() => setInput("List top 5 vendors by spend")}
                        className="block w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-left text-sm transition-colors"
                      >
                        📊 "List top 5 vendors by spend"
                      </button>
                      <button
                        onClick={() => setInput("Show me invoices from last month")}
                        className="block w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-left text-sm transition-colors"
                      >
                        📄 "Show me invoices from last month"
                      </button>
                      <button
                        onClick={() => setInput("What's the average invoice value?")}
                        className="block w-full p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-left text-sm transition-colors"
                      >
                        📈 "What's the average invoice value?"
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap font-medium">
                        {message.content}
                      </p>

                      {message.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
                          <strong>Error:</strong> {message.error}
                        </div>
                      )}

                      {message.sql && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Code2 className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-700">Generated SQL:</span>
                          </div>
                          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                            {message.sql}
                          </pre>
                        </div>
                      )}

                      {message.type === 'assistant' && renderResults(message)}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#1E3A8A]" />
                      <span className="text-sm text-gray-600">Generating SQL...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder="Ask a question about your data..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 border-gray-300"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}