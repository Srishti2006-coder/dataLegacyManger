import React, { useState, useRef, useEffect, useCallback } from 'react';

const TagInput = ({ value = [], onChange, placeholder = "Type or select a category (e.g., Work, Finance...)", suggestions = [
  'Social', 'Finance', 'Work', 'Education', 'Health', 'Crypto', 'Email', 'Banking', 'Shopping', 'Streaming'
], maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Tag colors
  const getTagColor = (tag) => {
    const colors = {
      'Finance': '#10b981', 'Banking': '#10b981', // green
      'Work': '#3b82f6', 'Professional': '#3b82f6', // blue
      'Social': '#8b5cf6', // purple
      'Education': '#f59e0b', // orange
      'Health': '#ef4444', // red
      'Crypto': '#f97316', // orange-red
      'Email': '#06b6d4', // cyan
      'Shopping': '#14b8b4', // teal
      'Streaming': '#ec4899' // pink
    };
    return colors[tag] || '#6366f1'; // indigo default
  };

  const addTag = useCallback((tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxTags) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  }, [value, onChange, maxTags]);

  const removeTag = useCallback((indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  }, [value, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    }
  }, [inputValue, value, addTag, removeTag]);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setInputValue(val);

    // Filter suggestions
    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(val.toLowerCase())
    );
    setFilteredSuggestions(filtered.slice(0, 5)); // Top 5
  }, [suggestions]);

  const handleSuggestionClick = useCallback((suggestion) => {
    addTag(suggestion);
  }, [addTag]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="tag-input-container" ref={containerRef} style={{
      position: 'relative',
      padding: '12px 16px',
      border: '2px solid #475569',
      borderRadius: '12px',
      background: '#1a1a2e',
      minHeight: '56px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
      transition: 'all 0.2s ease',
      borderColor: isFocused ? '#6366f1' : '#475569',
      boxShadow: isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none'
    }}>
      {value.map((tag, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: getTagColor(tag),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transform: 'scale(1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
        >
          {tag}
          <button
            onClick={() => removeTag(index)}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontSize: '16px',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '0.8'; }}
          >
            ×
          </button>
        </div>
      ))}

      <input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        placeholder={value.length === 0 ? placeholder : ''}
        style={{
          flex: 1,
          minWidth: '120px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: 'white',
          fontSize: '16px',
          padding: 0
        }}
      />

      {isFocused && filteredSuggestions.length > 0 && inputValue && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#1e293b',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10,
          border: '1px solid #475569'
        }}>
          {filteredSuggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #334155',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#334155'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            >
              <span style={{ marginRight: '12px', fontWeight: 500, color: getTagColor(suggestion) }}>
                ■
              </span>
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {value.length >= maxTags && (
        <small style={{ color: '#94a3b8', fontSize: '12px' }}>
          Max {maxTags} tags reached
        </small>
      )}
    </div>
  );
};

export default TagInput;
