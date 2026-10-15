'use client';

import React, { useState } from 'react';
import { SavedQRCode, QRDownloadHistoryItem } from '@/types/qr';
import { Modal } from '@/components/ui/Modal';
import {
  FolderOpen,
  Copy,
  Trash2,
  Edit2,
  Download,
  Calendar,
  ExternalLink,
  Search,
  Check,
  AlertTriangle,
  History,
  Clock,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedQRCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCodes: SavedQRCode[];
  downloadHistory?: QRDownloadHistoryItem[];
  isAuthenticated: boolean;
  onLoadCode: (code: SavedQRCode | QRDownloadHistoryItem) => void;
  onDuplicateCode: (code: SavedQRCode) => void;
  onRenameCode: (id: string, newName: string) => void;
  onDeleteCode: (id: string) => void;
  onClearAll?: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  onClearHistory?: () => void;
  onReDownload?: (item: QRDownloadHistoryItem) => void;
  onOpenAuth: () => void;
}

export function SavedQRCodesModal({
  isOpen,
  onClose,
  savedCodes,
  downloadHistory = [],
  isAuthenticated,
  onLoadCode,
  onDuplicateCode,
  onRenameCode,
  onDeleteCode,
  onClearAll,
  onDeleteHistoryItem,
  onClearHistory,
  onReDownload,
  onOpenAuth,
}: SavedQRCodesModalProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isConfirmingClearAll, setIsConfirmingClearAll] = useState(false);
  const [isConfirmingClearHistory, setIsConfirmingClearHistory] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCodes = savedCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.encodedString.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHistory = downloadHistory.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.type.toLowerCase().includes(search.toLowerCase()) ||
      h.encodedString.toLowerCase().includes(search.toLowerCase()) ||
      h.format.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartRename = (c: SavedQRCode) => {
    setEditingId(c.id);
    setEditName(c.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameCode(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Library & History"
      description={
        isAuthenticated
          ? 'Access your cloud-synced saved designs and download history.'
          : 'Stored locally in your browser. Sign in to sync across devices.'
      }
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Banner if in guest mode */}
        {!isAuthenticated && (
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Guest Mode: Sign in to sync saved designs and download history to the cloud.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Tab Switcher: Saved Designs vs Download History */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('saved');
              setSearch('');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer',
              activeTab === 'saved'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Saved Designs</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'saved' ? 'bg-[#FFF2EB] text-[#FF6B2C]' : 'bg-slate-200 text-slate-600'
              )}
            >
              {savedCodes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setSearch('');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer',
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <History className="w-3.5 h-3.5 text-[#FF6B2C]" />
            <span>Download History</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                activeTab === 'history' ? 'bg-[#FFF2EB] text-[#FF6B2C]' : 'bg-slate-200 text-slate-600'
              )}
            >
              {downloadHistory.length}
            </span>
          </button>
        </div>

        {/* TAB 1: SAVED DESIGNS */}
        {activeTab === 'saved' && (
          <div className="space-y-3.5">
            {/* Search Bar & Clear All Action */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search saved designs by name or link..."
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-[#E5E5E5] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:bg-white transition"
                />
              </div>

              {onClearAll && savedCodes.length > 0 && (
                <div>
                  {isConfirmingClearAll ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-xl">
                      <span className="text-[11px] text-rose-700 font-semibold px-1">Wipe all?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClearAll();
                          setIsConfirmingClearAll(false);
                        }}
                        className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearAll(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300 transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearAll(true)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition shrink-0"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* List of saved QR codes */}
            {filteredCodes.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No saved QR codes found</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  {search
                    ? 'No designs match your search query.'
                    : 'Click "Save to Library" on any generated code to save it here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCodes.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-[#E5E5E5] hover:border-slate-300 rounded-xl transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 text-sm border border-[#FF6B2C] rounded-lg focus:outline-none w-full max-w-xs"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(item.id)}
                            className="p-1 bg-[#FF6B2C] text-white rounded-md hover:bg-[#E85B1E]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => handleStartRename(item)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium uppercase text-[10px] text-slate-600 tracking-wider">
                          {item.type}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs text-slate-400 font-mono text-[11px]">
                          {item.encodedString}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadCode(item);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 bg-[#FFF2EB] hover:bg-[#FFE6D9] text-[#FF6B2C] text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Load</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateCode(item)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Duplicate design"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-700 font-semibold px-1">Delete?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCode(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300 cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete QR code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOWNLOAD HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3.5">
            {/* Search Bar & Clear History Action */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search download history..."
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-[#E5E5E5] rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B2C] focus:bg-white transition"
                />
              </div>

              {onClearHistory && downloadHistory.length > 0 && (
                <div>
                  {isConfirmingClearHistory ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-xl">
                      <span className="text-[11px] text-rose-700 font-semibold px-1">Wipe history?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClearHistory();
                          setIsConfirmingClearHistory(false);
                        }}
                        className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearHistory(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300 transition"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearHistory(true)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition shrink-0"
                    >
                      Clear History
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* List of download history */}
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">No downloads recorded yet</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  {search
                    ? 'No history matches your search query.'
                    : 'Whenever you download a QR code, it will be automatically recorded in your cloud collection.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-[#E5E5E5] hover:border-slate-300 rounded-xl transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded bg-[#FFF2EB] text-[#FF6B2C] border border-[#FFE6D9] font-mono text-[10px] uppercase font-bold tracking-wider">
                          {item.format.toUpperCase()} {item.format === 'png' ? `${item.resolution}px` : 'Vector'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium uppercase text-[10px] text-slate-600 tracking-wider">
                          {item.type}
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-xs text-slate-400 font-mono text-[11px]">
                          {item.encodedString}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(item.downloadedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {onReDownload && (
                        <button
                          type="button"
                          onClick={() => onReDownload(item)}
                          className="px-2.5 py-1.5 bg-[#FF6B2C] hover:bg-[#E85B1E] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="Re-download this QR code"
                        >
                          <Download className="w-3 h-3" />
                          <span>Re-download</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onLoadCode(item);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                        title="Load into Editor"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Load</span>
                      </button>

                      {onDeleteHistoryItem && (
                        <button
                          type="button"
                          onClick={() => onDeleteHistoryItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
