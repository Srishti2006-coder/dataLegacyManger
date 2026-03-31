import { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your LegacyAI Assistant. Ask me about managing digital assets, nominees, or vault security!", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mockAIResponses = {
    'asset': 'To add an asset, click "Add Asset" card. Enter details like title, URL, credentials (auto-encrypted), and categories. Everything is secured with your email key!',
    'nominee': 'Nominees get emergency access after verification. Go to "Set Nominee", add their details. They can request access via OTP if needed.',
    'vault': 'Your vault stores all assets encrypted. Only you can decrypt with your email. Nominees access only after approval.',
    'security': 'All credentials are encrypted client-side. Use unique passwords, enable 2FA. Review assets regularly via "View Assets".',
    'default': "Great question! For assets: add via dashboard. For nominees: set trusted contacts. Need help with Vault or Will? Ask away!"
  };

  const getAIResponse = (userMsg) => {
    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes('asset') || lowerMsg.includes('add')) return mockAIResponses.asset;
    if (lowerMsg.includes('nominee') || lowerMsg.includes('access')) return mockAIResponses.nominee;
    if (lowerMsg.includes('vault')) return mockAIResponses.vault;
    if (lowerMsg.includes('secure') || lowerMsg.includes('password')) return mockAIResponses.security;
    return mockAIResponses.default;
  };

  const handleSend = () => {
    if (input.trim() === '' || isTyping) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = { id: Date.now() + 1, text: getAIResponse(input), sender: 'ai' };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '9999px',
          background: 'linear-gradient(to right, #3b82f6, #a855f7)',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), 0 25px 50px rgba(0,0,0,0.25)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.5), 0 30px 60px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4), 0 25px 50px rgba(0,0,0,0.25)';
        }}
      >
{isOpen ? '×' : 'Chat'}
      </button>

      {/* Chat Window */}
{isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '6.5rem',
            right: '1.5rem',
            zIndex: 9998,
            width: '20rem',
            height: '24rem',
            background: 'rgba(17, 24, 39, 0.98)',
            border: '1px solid #374151',
            borderRadius: '1rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: 'linear-gradient(to right, #3b82f6, #a855f7)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              AI
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontWeight: 'bold',
                color: 'white',
                fontSize: '1.125rem'
              }}>LegacyAI Assistant</h3>
              <p style={{
                margin: '0.25rem 0 0 0',
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>How can I help with your digital legacy?</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '0.75rem 1rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      ... (msg.sender === 'user' 
                        ? { 
                            background: '#3b82f6',
                            color: 'white'
                          }
                        : {
                            background: '#1f2937',
                            color: '#d1d5db',
                            border: '1px solid #374151'
                          }
                      )
                    }}
                  >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  background: '#1f2937',
                  color: '#d1d5db',
                  padding: '0.75rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  border: '1px solid #374151'
                }}>
                  AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #374151'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 1rem',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={input.trim() === '' || isTyping}
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(to right, #3b82f6, #a855f7)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: input.trim() === '' || isTyping ? 'not-allowed' : 'pointer',
                  opacity: input.trim() === '' || isTyping ? 0.5 : 1
                }}
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;

