/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Download, Upload, FileJson, FileSpreadsheet, FileText, Plus, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { Activity, ActivityType, AppState, Initiative, RagStatus } from '../types';
import { MONTHS, FUNCTIONS } from '../constants';
import * as XLSX from 'xlsx';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Partial<Activity> | null;
  initiatives: Initiative[];
  onSave: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityModal({ isOpen, onClose, activity, initiatives, onSave, onDelete }: ActivityModalProps) {
  const [formData, setFormData] = useState<Partial<Activity>>({
    type: 'activity',
    label: '',
    kpi: '',
    tooltip: '',
    month: 0,
    init: '',
  });

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        type: 'activity',
        label: '',
        kpi: '',
        tooltip: '',
        month: 0,
        init: initiatives[0]?.id || '',
      });
    }
  }, [activity, initiatives, isOpen]);

  const handleSave = () => {
    if (!formData.label?.trim()) return;
    onSave({
      ...formData,
      id: formData.id || 'u' + Date.now(),
      done: formData.done || false,
    } as Activity);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/55"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative bg-white rounded-lg w-full max-w-[420px] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-display text-[0.78rem] font-extrabold tracking-tight uppercase">
                {activity?.id ? 'Edit Activity' : 'Add Activity'}
              </span>
              <button onClick={onClose} className="text-muted hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-1 flex-wrap">
                {(['activity', 'milestone', 'risk', 'deliverable'] as ActivityType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={cn(
                      "px-3 py-1 border border-border rounded-full font-display text-[0.52rem] font-bold tracking-widest uppercase transition-all",
                      formData.type === t ? "bg-navy text-white border-navy" : "bg-sand text-muted hover:border-navy"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">Label</label>
                <input
                  className="p-2 border border-border rounded-sm text-[0.76rem] bg-sand focus:outline-none focus:border-steel"
                  placeholder="Activity name..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">KPI / Description</label>
                <input
                  className="p-2 border border-border rounded-sm text-[0.76rem] bg-sand focus:outline-none focus:border-steel"
                  placeholder="Target or description..."
                  value={formData.kpi}
                  onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">Initiative</label>
                  <select
                    className="p-2 border border-border rounded-sm text-[0.76rem] bg-sand focus:outline-none focus:border-steel"
                    value={formData.init}
                    onChange={(e) => setFormData({ ...formData, init: e.target.value })}
                  >
                    {initiatives.map((i) => (
                      <option key={i.id} value={i.id}>{i.id} — {i.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">Month</label>
                  <select
                    className="p-2 border border-border rounded-sm text-[0.76rem] bg-sand focus:outline-none focus:border-steel"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">Notes</label>
                <textarea
                  className="p-2 border border-border rounded-sm text-[0.72rem] bg-sand focus:outline-none focus:border-steel min-h-[60px] resize-y"
                  placeholder="Details..."
                  value={formData.tooltip}
                  onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t border-border">
              {activity?.id && (
                <button
                  onClick={() => { onDelete(activity.id!); onClose(); }}
                  className="mr-auto flex items-center gap-1.5 px-3 py-1.5 bg-rose/10 border border-rose/30 text-rose rounded-sm text-[0.68rem] font-medium hover:bg-rose/20 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-sand border border-border text-muted rounded-sm text-[0.68rem] hover:bg-border/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-steel text-white rounded-sm font-display text-[0.62rem] font-bold tracking-widest uppercase hover:bg-sky transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSave: (name: string) => void;
}

export function UserModal({ isOpen, onClose, userName, onSave }: UserModalProps) {
  const [name, setName] = useState(userName);

  useEffect(() => {
    setName(userName);
  }, [userName, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/60"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative bg-white rounded-lg w-full max-w-[360px] p-7 shadow-2xl"
          >
            <h3 className="font-display text-[1rem] font-extrabold text-navy mb-1.5">Who are you?</h3>
            <p className="text-[0.78rem] text-muted mb-4 leading-relaxed">
              Your name will be recorded whenever you move a milestone or activity, so the team can track who made each change.
            </p>
            <input
              className="w-full p-2.5 border border-border rounded-sm font-sans text-[0.85rem] bg-sand mb-4 focus:outline-none focus:border-steel"
              placeholder="e.g. Mohamed AlNaqeeb"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button
              onClick={handleSave}
              className="w-full p-2.5 bg-steel text-white rounded-sm font-display text-[0.68rem] font-bold tracking-widest uppercase hover:bg-sky transition-colors"
            >
              Start Planning
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onImport: (state: AppState) => void;
  activeTab: string;
}

export function ImportExportModal({ isOpen, onClose, state, onImport, activeTab }: ImportExportModalProps) {
  const [view, setView] = useState<'actions' | 'grid'>('actions');
  const [gridSection, setGridSection] = useState(activeTab === 'master' ? 'cs' : activeTab);
  const [gridData, setGridData] = useState<Activity[]>([]);

  useEffect(() => {
    if (isOpen && view === 'grid') {
      setGridData(state.activities[gridSection] || []);
    }
  }, [isOpen, view, gridSection, state.activities]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tqt_planner_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = (section: string) => {
    const rows = [['ID', 'Init', 'Month', 'Type', 'Label', 'KPI', 'Done', 'RAG', 'Notes']];
    const data = view === 'grid' ? gridData : (state.activities[section] || []);
    
    data.forEach(a => {
      rows.push([
        a.id, 
        a.init, 
        MONTHS[a.month], 
        a.type, 
        a.label, 
        a.kpi || '', 
        a.done ? 'Yes' : 'No', 
        a.rag || 'b',
        a.tooltip || ''
      ]);
    });
    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tqt_${section}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImport(parsed);
        onClose();
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      if (lines.length < 2) return;
      
      const importedActivities: Activity[] = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const monthIdx = MONTHS.indexOf(values[2]);
        return {
          id: values[0] || 'u' + Math.random().toString(36).substr(2, 9),
          init: values[1],
          month: monthIdx === -1 ? 0 : monthIdx,
          type: (values[3] as ActivityType) || 'activity',
          label: values[4],
          kpi: values[5],
          done: values[6].toLowerCase() === 'yes',
          rag: (values[7] as RagStatus) || 'b',
          tooltip: values[8]
        };
      });

      if (view === 'grid') {
        setGridData(importedActivities);
      } else {
        const newState = { ...state };
        newState.activities[gridSection] = importedActivities;
        onImport(newState);
      }
    };
    reader.readAsText(file);
  };

  const handleAddRow = () => {
    const newAct: Activity = {
      id: 'u' + Date.now(),
      init: state.initiatives[gridSection]?.[0]?.id || '',
      month: 0,
      type: 'activity',
      label: 'New Activity',
      done: false,
      rag: 'b'
    };
    setGridData([...gridData, newAct]);
  };

  const handleApplyGrid = () => {
    const newState = { ...state };
    newState.activities[gridSection] = gridData;
    onImport(newState);
    onClose();
  };

  const updateGridRow = (index: number, field: keyof Activity, value: any) => {
    const newData = [...gridData];
    newData[index] = { ...newData[index], [field]: value };
    setGridData(newData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/55"
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={cn(
              "relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
              view === 'actions' ? "w-full max-w-[360px]" : "w-full max-w-[90vw] h-[80vh]"
            )}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-sand/30">
              <div className="flex items-center gap-4">
                <span className="font-display text-[0.78rem] font-extrabold tracking-tight uppercase">Import / Export</span>
                <div className="flex bg-border/20 p-0.5 rounded-sm">
                  <button 
                    onClick={() => setView('actions')}
                    className={cn("px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider rounded-sm transition-all", view === 'actions' ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy")}
                  >
                    Quick
                  </button>
                  <button 
                    onClick={() => setView('grid')}
                    className={cn("px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider rounded-sm transition-all", view === 'grid' ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy")}
                  >
                    Excel Editor
                  </button>
                </div>
              </div>
              <button onClick={onClose} className="text-muted hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>

            {view === 'actions' ? (
              <div className="p-5 flex flex-col gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-3 w-full p-3 border border-border rounded-md bg-sand text-navy text-[0.76rem] hover:border-steel transition-colors text-left"
                >
                  <FileJson size={18} className="text-steel" />
                  <span>Export full state (JSON)</span>
                </button>

                <button
                  onClick={() => handleExportCSV(activeTab === 'master' ? 'cs' : activeTab)}
                  className="flex items-center gap-3 w-full p-3 border border-border rounded-md bg-sand text-navy text-[0.76rem] hover:border-steel transition-colors text-left"
                >
                  <FileText size={18} className="text-amber" />
                  <span>Export active tab (CSV)</span>
                </button>

                <hr className="my-2 border-border" />

                <label className="flex items-center gap-3 w-full p-3 border border-border rounded-md bg-sand text-navy text-[0.76rem] hover:border-steel transition-colors text-left cursor-pointer">
                  <Upload size={18} className="text-mint" />
                  <div>
                    <div className="font-semibold">Import JSON</div>
                    <div className="text-[0.65rem] text-muted italic">Combined planner or trajectory files</div>
                  </div>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
                </label>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-sand/10">
                  <div className="flex items-center gap-3">
                    <select 
                      value={gridSection}
                      onChange={(e) => setGridSection(e.target.value)}
                      className="p-1.5 border border-border rounded-sm text-[0.7rem] bg-white font-bold uppercase tracking-wider"
                    >
                      {FUNCTIONS.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAddRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-mint/10 border border-mint/30 text-mint rounded-sm text-[0.65rem] font-bold uppercase tracking-wider hover:bg-mint/20"
                    >
                      <Plus size={14} /> Add Row
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber/10 border border-amber/30 text-amber rounded-sm text-[0.65rem] font-bold uppercase tracking-wider hover:bg-amber/20 cursor-pointer">
                      <Upload size={14} /> Import CSV
                      <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button 
                      onClick={() => handleExportCSV(gridSection)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-steel/10 border border-steel/30 text-steel rounded-sm text-[0.65rem] font-bold uppercase tracking-wider hover:bg-steel/20"
                    >
                      <FileSpreadsheet size={14} /> Export CSV
                    </button>
                    <button 
                      onClick={handleApplyGrid}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-navy text-white rounded-sm text-[0.65rem] font-bold uppercase tracking-wider hover:bg-steel"
                    >
                      <Save size={14} /> Apply Changes
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <table className="w-full border-collapse text-[0.7rem]">
                    <thead className="sticky top-0 bg-sand z-10">
                      <tr>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">ID</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Init</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Month</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Type</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Label</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">KPI</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Done</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">RAG</th>
                        <th className="border border-border p-2 text-left bg-border/10 uppercase tracking-widest font-bold text-[0.55rem]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gridData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-sand/20">
                          <td className="border border-border p-1">
                            <input 
                              value={row.id} 
                              readOnly 
                              className="w-full bg-transparent p-1 outline-none opacity-50 cursor-not-allowed" 
                            />
                          </td>
                          <td className="border border-border p-1">
                            <select 
                              value={row.init}
                              onChange={(e) => updateGridRow(idx, 'init', e.target.value)}
                              className="w-full bg-transparent p-1 outline-none"
                            >
                              {state.initiatives[gridSection]?.map(i => (
                                <option key={i.id} value={i.id}>{i.id}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-border p-1">
                            <select 
                              value={row.month}
                              onChange={(e) => updateGridRow(idx, 'month', parseInt(e.target.value))}
                              className="w-full bg-transparent p-1 outline-none"
                            >
                              {MONTHS.map((m, i) => (
                                <option key={m} value={i}>{m}</option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-border p-1">
                            <select 
                              value={row.type}
                              onChange={(e) => updateGridRow(idx, 'type', e.target.value)}
                              className="w-full bg-transparent p-1 outline-none"
                            >
                              <option value="activity">Activity</option>
                              <option value="milestone">Milestone</option>
                              <option value="risk">Risk</option>
                              <option value="deliverable">Deliverable</option>
                            </select>
                          </td>
                          <td className="border border-border p-1">
                            <input 
                              value={row.label}
                              onChange={(e) => updateGridRow(idx, 'label', e.target.value)}
                              className="w-full bg-transparent p-1 outline-none focus:bg-white" 
                            />
                          </td>
                          <td className="border border-border p-1">
                            <input 
                              value={row.kpi || ''}
                              onChange={(e) => updateGridRow(idx, 'kpi', e.target.value)}
                              className="w-full bg-transparent p-1 outline-none focus:bg-white" 
                            />
                          </td>
                          <td className="border border-border p-1 text-center">
                            <input 
                              type="checkbox"
                              checked={row.done}
                              onChange={(e) => updateGridRow(idx, 'done', e.target.checked)}
                              className="accent-steel"
                            />
                          </td>
                          <td className="border border-border p-1">
                            <select 
                              value={row.rag}
                              onChange={(e) => updateGridRow(idx, 'rag', e.target.value)}
                              className="w-full bg-transparent p-1 outline-none"
                            >
                              <option value="g">Green</option>
                              <option value="a">Amber</option>
                              <option value="r">Red</option>
                              <option value="b">Blue</option>
                            </select>
                          </td>
                          <td className="border border-border p-1 text-center">
                            <button 
                              onClick={() => setGridData(gridData.filter((_, i) => i !== idx))}
                              className="text-rose hover:scale-110 transition-transform"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface MilestoneDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: any;
  functionData: any;
  onSave: (id: string, data: { rag: RagStatus; note: string }) => void;
}

export function MilestoneDetailPanel({ isOpen, onClose, milestone, functionData, onSave }: MilestoneDetailPanelProps) {
  const [rag, setRag] = useState<RagStatus>('b');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (milestone) {
      setRag(milestone.rag || 'b');
      setNote(milestone.note || '');
    }
  }, [milestone, isOpen]);

  if (!milestone || !functionData) return null;

  return (
    <div className={cn(
      "fixed right-0 top-[96px] bottom-0 w-[300px] bg-white border-l border-border shadow-2xl transition-transform duration-300 z-[150] overflow-y-auto flex flex-col",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-5 border-b border-border flex items-start justify-between shrink-0">
        <div>
          <div className="text-[0.58rem] font-bold tracking-widest uppercase mb-1.5" style={{ color: functionData.color }}>
            {functionData.label}
          </div>
          <div className="font-display text-[0.82rem] font-extrabold leading-tight">{milestone.label}</div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-navy transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
        <div>
          <div className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted mb-1">Month</div>
          <div className="text-[0.76rem]">{MONTHS[milestone.month]} 2026</div>
        </div>
        <div>
          <div className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted mb-1">Owner</div>
          <div className="text-[0.76rem]">{functionData.owner}</div>
        </div>
        <div>
          <div className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted mb-1">KPI / Target</div>
          <div className="text-[0.7rem] text-mint italic">{milestone.kpi || '—'}</div>
        </div>

        <div>
          <div className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted mb-1.5">RAG Status</div>
          <div className="flex gap-1 flex-wrap">
            {(['g', 'a', 'r', 'b'] as RagStatus[]).map((r) => (
              <button
                key={r}
                onClick={() => setRag(r)}
                className={cn(
                  "px-2.5 py-1 rounded-full border font-display text-[0.5rem] font-bold tracking-widest transition-all",
                  r === 'g' && (rag === 'g' ? "bg-rag-g text-white border-rag-g" : "text-rag-g border-rag-g/40"),
                  r === 'a' && (rag === 'a' ? "bg-rag-a text-white border-rag-a" : "text-rag-a border-rag-a/40"),
                  r === 'r' && (rag === 'r' ? "bg-rag-r text-white border-rag-r" : "text-rag-r border-rag-r/40"),
                  r === 'b' && (rag === 'b' ? "bg-muted text-white border-muted" : "text-muted border-muted/40")
                )}
              >
                {r === 'g' ? 'On Track' : r === 'a' ? 'At Risk' : r === 'r' ? 'Off Track' : 'Not Started'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="font-display text-[0.52rem] font-bold tracking-widest uppercase text-muted">Notes</div>
          <textarea
            className="w-full p-2 border border-border rounded-sm font-sans text-[0.72rem] bg-sand min-h-[80px] focus:outline-none focus:border-steel"
            placeholder="Progress notes, blockers..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button
          onClick={() => { onSave(milestone.id, { rag, note }); onClose(); }}
          className="mt-4 p-2.5 bg-steel text-white rounded-sm font-display text-[0.6rem] font-bold tracking-widest uppercase hover:bg-sky transition-colors"
        >
          Save Update
        </button>
      </div>
    </div>
  );
}
