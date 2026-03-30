/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { TabNav } from './components/TabNav';
import { MasterMap } from './components/MasterMap';
import { DetailTab } from './components/DetailTab';
import { ActivityModal, UserModal, ImportExportModal, MilestoneDetailPanel } from './components/Modals';
import { useAppState } from './useAppState';
import { FUNCTIONS, DETAIL_TABS } from './constants';
import { Activity, RagStatus } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
    state,
    updateNowMonth,
    updateActivity,
    deleteActivity,
    cycleInitiativeRag,
    cycleActivityRag,
    cycleMapMilestoneRag,
    toggleActivityDone,
    addTask,
    toggleTask,
    deleteTask,
    updateMapMilestone,
    importFullState,
    moveActivity,
    moveMapMilestone,
  } = useAppState();

  const [activeTab, setActiveTab] = useState('master');
  const [userName, setUserName] = useState(() => localStorage.getItem('tqt_user') || '');
  const [sidebarOpen, setSidebarOpen] = useState<Record<string, boolean>>({
    cs: false, km: false, inn: false, cm: false, eq: false
  });
  const [sidebarPanel, setSidebarPanel] = useState<Record<string, string>>({
    cs: 'summary', km: 'summary', inn: 'summary', cm: 'summary', eq: 'summary'
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(!userName);
  const [isIEModalOpen, setIsIEModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Partial<Activity> | null>(null);
  const [editingTab, setEditingTab] = useState<string>('');

  const [isMilestonePanelOpen, setIsMilestonePanelOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedFunction, setSelectedFunction] = useState<any>(null);

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2200);
  }, []);

  const handleSaveUser = (name: string) => {
    setUserName(name);
    localStorage.setItem('tqt_user', name);
    showToast('Name updated');
  };

  const handleToggleSidebar = (panel: string) => {
    if (activeTab === 'master') return;
    setSidebarOpen(prev => {
      const isOpen = prev[activeTab];
      const currentPanel = sidebarPanel[activeTab];
      if (isOpen && currentPanel === panel) {
        return { ...prev, [activeTab]: false };
      }
      return { ...prev, [activeTab]: true };
    });
    setSidebarPanel(prev => ({ ...prev, [activeTab]: panel }));
  };

  const handleOpenNewAct = (tab: string, initId: string, month: number) => {
    setEditingTab(tab);
    setEditingActivity({ init: initId, month, type: 'activity' });
    setIsActivityModalOpen(true);
  };

  const handleOpenEditAct = (id: string) => {
    let foundTab = '';
    let foundAct: Activity | undefined;
    DETAIL_TABS.forEach(t => {
      const a = state.activities[t].find(act => act.id === id);
      if (a) {
        foundTab = t;
        foundAct = a;
      }
    });
    if (foundAct) {
      setEditingTab(foundTab);
      setEditingActivity(foundAct);
      setIsActivityModalOpen(true);
    }
  };

  const handleSaveActivity = (act: Activity) => {
    const isNew = !state.activities[editingTab].find(a => a.id === act.id);
    updateActivity(editingTab, act);
    showToast(isNew ? 'Activity added' : 'Activity updated');
  };

  const handleDeleteActivity = (id: string) => {
    deleteActivity(editingTab, id);
    showToast('Activity deleted');
  };

  const handleOpenMilestoneDetail = (msId: string, fnId: string) => {
    const fn = FUNCTIONS.find(f => f.id === fnId);
    const msDef = fn?.milestones.find(m => m.id === msId);
    if (msDef) {
      const msState = state.mapMilestones[msId] || {};
      setSelectedMilestone({ ...msDef, ...msState });
      setSelectedFunction(fn);
      setIsMilestonePanelOpen(true);
    }
  };

  const handleSaveMilestone = (id: string, data: { rag: RagStatus; note: string }) => {
    updateMapMilestone(id, data);
    showToast('Milestone updated');
  };

  const handleRevertActivity = (id: string) => {
    let act: Activity | undefined;
    let tab = '';
    DETAIL_TABS.forEach(t => {
      const a = state.activities[t].find(act => act.id === id);
      if (a) { act = a; tab = t; }
    });

    if (act && act.moveHistory?.length) {
      const last = act.moveHistory[act.moveHistory.length - 1];
      const newHistory = [...act.moveHistory];
      newHistory.push({
        from: act.month,
        to: last.from,
        by: `${userName} (revert)`,
        at: new Date().toISOString()
      });
      updateActivity(tab, { ...act, month: last.from, moveHistory: newHistory });
      showToast(`Reverted to ${last.from}`);
    }
  };

  const handleClearHistory = (tab: string) => {
    if (!window.confirm('Clear all move history for this function?')) return;
    const newActs = state.activities[tab].map(a => ({ ...a, moveHistory: [] }));
    state.activities[tab] = newActs;
    importFullState({ ...state });
    showToast('History cleared');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sand">
      <TopBar
        userName={userName}
        onPromptUser={() => setIsUserModalOpen(true)}
        onOpenIE={() => setIsIEModalOpen(true)}
        onSave={() => showToast('Saved')}
        lastSaved={state.lastSaved}
        activeTab={activeTab}
        onToggleSidebar={handleToggleSidebar}
      />

      <TabNav activeTab={activeTab} onSwitchTab={setActiveTab} />

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'master' ? (
          <MasterMap
            state={state}
            onUpdateNowMonth={updateNowMonth}
            onMoveMilestone={(id, to) => moveMapMilestone(id, to, userName || 'User')}
            onOpenDetail={handleOpenMilestoneDetail}
            onCycleRag={cycleMapMilestoneRag}
          />
        ) : (
          <DetailTab
            tab={activeTab}
            state={state}
            onUpdateNowMonth={updateNowMonth}
            onCycleRag={cycleInitiativeRag}
            onToggleDone={(id) => toggleActivityDone(activeTab, id)}
            onOpenNewAct={handleOpenNewAct}
            onOpenEditAct={handleOpenEditAct}
            onMoveActivity={(id, to) => moveActivity(activeTab, id, to, userName || 'User')}
            sidebarOpen={sidebarOpen[activeTab]}
            sidebarPanel={sidebarPanel[activeTab]}
            onSwitchPanel={(p) => setSidebarPanel(prev => ({ ...prev, [activeTab]: p }))}
            onAddTask={addTask}
            onToggleTask={(id) => toggleTask(activeTab, id)}
            onDeleteTask={(id) => deleteTask(activeTab, id)}
            onRevertActivity={handleRevertActivity}
            onClearHistory={handleClearHistory}
            onCycleActivityRag={(id) => cycleActivityRag(activeTab, id)}
          />
        )}
      </main>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userName={userName}
        onSave={handleSaveUser}
      />

      <ImportExportModal
        isOpen={isIEModalOpen}
        onClose={() => setIsIEModalOpen(false)}
        state={state}
        onImport={importFullState}
        activeTab={activeTab}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        activity={editingActivity}
        initiatives={state.initiatives[editingTab] || []}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />

      <MilestoneDetailPanel
        isOpen={isMilestonePanelOpen}
        onClose={() => setIsMilestonePanelOpen(false)}
        milestone={selectedMilestone}
        functionData={selectedFunction}
        onSave={handleSaveMilestone}
      />

      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 right-6 z-[600] bg-navy text-white px-4 py-2.5 rounded-sm text-[0.7rem] shadow-xl pointer-events-none"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="hidden md:flex items-center justify-between px-7 py-2 bg-navy/5 text-[0.6rem] text-muted font-display uppercase tracking-widest border-t border-border/50">
        <span>TQT Corporate Strategy & Innovation · 2026 Strategy & Innovation Planner</span>
        <span>TAQA Transmission</span>
      </footer>
    </div>
  );
}
