"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  content: string;
  sources?: { content: string; page: number | string }[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Welcome to the Senior Bank Compliance Assistant. How can I help you verify RBI guidelines today?" }
  ]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [docsCount, setDocsCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setDocsCount(prev => prev + 1);
      setMessages(prev => [...prev, { role: "bot", content: `Successfully indexed ${file.name}. You can now ask questions about its content.` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", content: "Error uploading document. Please ensure the backend is running." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsThinking(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", content: data.answer, sources: data.sources }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to my compliance database. Please verify the backend service." }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <main>
      <header>
        <h1>Compliance Assistant</h1>
        <p className="subtitle">Official RBI & Indian Banking Guideline Verification</p>
      </header>

      <div className="container">
        <div className="sidebar">
          <section>
            <div className="card-title">Document Repository</div>
            <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
              {isUploading ? "Processing..." : "Drop RBI Circulars (PDF)"}
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                onChange={handleUpload} 
                accept=".pdf"
              />
            </div>
            <div className="status-indicator" style={{ marginTop: '1rem' }}>
              <div className="dot"></div>
              <span>{docsCount} Documents Indexed</span>
            </div>
          </section>

          <section>
            <div className="card-title">Guidelines Scope</div>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li>• Master Circulars (KYC/AML)</li>
              <li>• Digital Payment Frameworks</li>
              <li>• Priority Sector Lending</li>
              <li>• Banking Ombudsman Rules</li>
            </ul>
          </section>
        </div>

        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role === "user" ? "user-message" : "bot-message"}`}>
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources">
                    {msg.sources.map((s, si) => (
                      <span key={si} className="source-tag">Page {s.page}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isThinking && <div className="message bot-message">Analyzing guidelines...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <input 
              type="text" 
              placeholder="Ask a compliance question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>VERIFY</button>
          </div>
        </div>
      </div>
    </main>
  );
}
