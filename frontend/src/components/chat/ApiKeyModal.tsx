import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { geminiService } from '../../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKeyInput, setApiKeyInput] = useState(() => geminiService.getApiKey());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1E1F20] border border-[#3A3B3E] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-[#A8C7FA]" />
            <span>Gemini API Key Settings</span>
          </h3>
          <button onClick={onClose} className="text-[#888888] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#888888] mb-4">
          Configure your Google Gemini API key to activate high-performance operational reasoning.
        </p>

        <input
          type="password"
          placeholder="Enter Gemini API Key..."
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className="w-full bg-[#131314] text-xs text-white p-3 rounded-xl border border-[#2D2E30] focus:outline-none focus:border-[#4285F4] mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2A2B2D] text-xs text-[#C4C7C5] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (apiKeyInput.trim()) {
                geminiService.setApiKey(apiKeyInput.trim());
              }
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-[#4285F4] text-xs text-white font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
