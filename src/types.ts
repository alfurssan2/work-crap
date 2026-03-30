/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RagStatus = 'g' | 'a' | 'r' | 'b'; // Green, Amber, Red, Blue (Not Started)

export interface Milestone {
  id: string;
  month: number;
  label: string;
  kpi?: string;
  rag: RagStatus;
  note?: string;
  key?: boolean;
}

export interface FunctionData {
  id: string;
  label: string;
  owner: string;
  color: string;
  milestones: Milestone[];
}

export type ActivityType = 'activity' | 'milestone' | 'risk' | 'deliverable';

export interface MoveHistory {
  from: number;
  to: number;
  by: string;
  at: string;
  type?: string;
  fromRag?: RagStatus;
  toRag?: RagStatus;
  statusNote?: string;
}

export interface Activity {
  id: string;
  init: string;
  month: number;
  baselineMonth?: number;
  type: ActivityType;
  label: string;
  kpi?: string;
  tooltip?: string;
  done: boolean;
  rag: RagStatus;
  moveHistory?: MoveHistory[];
  _ragOverride?: RagStatus;
  _pct?: number;
  _notes?: string;
  _expDate?: string;
  _evidence?: string;
  _importedBy?: string;
  _importedAt?: string;
  _lastImportedRag?: string;
}

export interface Initiative {
  id: string;
  title: string;
  owner: string;
  rag: RagStatus;
}

export interface Task {
  id: string;
  title: string;
  owner?: string;
  done: boolean;
}

export interface AppState {
  nowMonth: number;
  mapMilestones: Record<string, { rag?: RagStatus; note?: string; currentMonth?: number; baselineMonth?: number; moveHistory?: MoveHistory[] }>;
  tasks: Record<string, Task[]>;
  activities: Record<string, Activity[]>;
  initiatives: Record<string, Initiative[]>;
  lastSaved?: string;
}

export interface Swimlane {
  owner: string;
  color: string;
  inits: string[];
}
