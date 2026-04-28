'use client';

import { useState, useRef, useEffect } from 'react';
import { authStore } from '@/features/auth/stores/authStore';
import api from '@/lib/axios';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSend: () => void;
  onMentionAdd?: (member: Member) => void;
}

export function MentionInput({ value, onChange, placeholder, onSend, onMentionAdd }: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Member[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { workspaceId } = authStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (workspaceId) {
      api.get(`/workspaces/${workspaceId}/members`, {
        headers: { 'x-workspace-id': workspaceId }
      }).then(res => {
        setSuggestions(res.data.data.map((m: any) => m.user));
      });
    }
  }, [workspaceId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredSuggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    onChange(newValue);
    setCursorPosition(position);

    const textBeforeCursor = newValue.slice(0, position);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const query = textBeforeCursor.slice(lastAt + 1);
      if (!/\s/.test(query)) {
        const filtered = suggestions.filter(s => 
          s.name.toLowerCase().includes(query.toLowerCase()) || 
          s.email.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const insertMention = (member: Member) => {
    const textBeforeAt = value.slice(0, value.lastIndexOf('@', cursorPosition - 1));
    const textAfterCursor = value.slice(cursorPosition);
    const mentionString = `@${member.name}`;
    const newValue = textBeforeAt + mentionString + ' ' + textAfterCursor;
    onChange(newValue);
    if (onMentionAdd) onMentionAdd(member);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[80px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
          <ScrollArea className="max-h-[200px]">
            <div className="p-1">
              {filteredSuggestions.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                    index === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
