'use client';

import React, { useState } from 'react';
import { SavedQRCode } from '@/types/qr';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedQRCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCodes: SavedQRCode[];
  isAuthenticated: boolean;
  onLoadCode: (code: SavedQRCode) => void;
  onDuplicateCode: (code: SavedQRCode) => void;
  onRenameCode: (id: string, newName: string) => void;
  onDeleteCode: (id: string) => void;
  onOpenAuth: () => void;
}

export function SavedQRCodesModal({
  isOpen,
  onClose,
  savedCodes,
  isAuthenticated,
  onLoadCode,
  onDuplicateCode,
  onRenameCode,
  onDeleteCode,
  onOpenAuth,
}: SavedQRCodesModalProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredCodes = savedCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase()) ||
      c.encodedString.toLowerCase().includes(search.toLowerCase())
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
      title="Saved QR Codes"
      description={
        isAuthenticated
          ? 'Synced to your cloud account and ready to edit or export.'
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
              <span>Guest Mode: QR codes are saved locally in this browser.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition"
            >
              Sign In to Cloud
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, or destination link..."
            className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
          />
        </div>

        {/* List of saved QR codes */}
        {filteredCodes.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No saved QR codes found</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              {search ? 'No designs match your search query.' : 'Click "Save QR Design" on any generated code to save it here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {filteredCodes.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 text-sm border border-indigo-500 rounded-lg focus:outline-none w-full max-w-xs"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(item.id)}
                        className="p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Load</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateCode(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
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
                        className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
    </Modal>
  );
}
