import React, { useState } from 'react';
import { AppSettings, EventTypeSetting } from '../types';
import { Settings, Save, RefreshCw, Upload, Download, Trash2, Plus, Check } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  lastSaved: string;
  onUpdateSettings: (updated: AppSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (data: string) => void;
  onResetData: () => void;
}

export default function SettingsView({
  settings,
  lastSaved,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetData,
}: SettingsViewProps) {
  // Local state for basic configurations
  const [churnMonths, setChurnMonths] = useState(settings.churnMonths);
  const [conversionThreshold, setConversionThreshold] = useState(settings.conversionThreshold);

  // New event type state
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeWeight, setNewTypeWeight] = useState(1.0);

  // JSON import field
  const [importText, setImportText] = useState('');

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      churnMonths: Number(churnMonths),
      conversionThreshold: Number(conversionThreshold),
    });
    alert('Global threshold rules updated and saved!');
  };

  const handleAddEventType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName) return;

    // Avoid duplicate
    if (settings.eventTypes.find((t) => t.type.toLowerCase() === newTypeName.toLowerCase())) {
      alert('This event type already exists!');
      return;
    }

    const updatedTypes = [...settings.eventTypes, { type: newTypeName, weight: Number(newTypeWeight) }];
    onUpdateSettings({
      ...settings,
      eventTypes: updatedTypes,
    });

    setNewTypeName('');
    setNewTypeWeight(1.0);
  };

  const handleDeleteEventType = (type: string) => {
    const updatedTypes = settings.eventTypes.filter((t) => t.type !== type);
    onUpdateSettings({
      ...settings,
      eventTypes: updatedTypes,
    });
  };

  const handleUpdateWeight = (type: string, weight: number) => {
    const updatedTypes = settings.eventTypes.map((t) => {
      if (t.type === type) {
        return { ...t, weight: Number(weight) };
      }
      return t;
    });
    onUpdateSettings({
      ...settings,
      eventTypes: updatedTypes,
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (file) {
      fileReader.onload = (event) => {
        const text = event.target?.result as string;
        onImportBackup(text);
      };
      fileReader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-up">
      {/* Column 1: Threshold & Database Settings */}
      <div className="space-y-6">
        {/* Global Threshold Rules */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="pb-4 border-b border-[#E8E8E6] mb-4">
            <h3 className="font-serif text-lg font-bold text-[#051C2C] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2251FF]" />
              Operational Threshold Rules
            </h3>
            <p className="text-xs text-[#888888] mt-1">
              Configure parameters that trigger automatic Slipping warnings or flag potential non-members ready to convert.
            </p>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Member Churn Warning Threshold (Months)
              </label>
              <input
                type="number"
                min={1}
                max={24}
                required
                value={churnMonths}
                onChange={(e) => setChurnMonths(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e]"
              />
              <span className="text-[10px] text-[#888888] mt-1 block">
                Members with no signed-in activity for longer than this duration will be automatically flagged as "Dormant" or "Slipping".
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">
                Conversion Target Attendance Count
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={conversionThreshold}
                onChange={(e) => setConversionThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e]"
              />
              <span className="text-[10px] text-[#888888] mt-1 block">
                When a Non-member reaches this number of lifetime attendances, they appear in the dashboard as prime candidates for outreach.
              </span>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#051C2C] hover:bg-black rounded-[6px] transition-all flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Operational Rules
            </button>
          </form>
        </div>

        {/* Local Storage Status & Backups */}
        <div className="bg-white rounded-[12px] p-6 card-shadow border-l-4 border-[#2251FF]">
          <h3 className="font-serif text-lg font-bold text-[#051C2C] mb-2">Local Storage & Backup Vault</h3>
          <div className="text-xs text-[#888888] space-y-4">
            <p>
              Your database is automatically persisted locally to your web browser. This ensures maximum privacy, fast responses, and offline capabilities.
            </p>
            <div className="p-3 bg-gray-50 rounded-[8px] flex items-center justify-between text-xs text-[#051C2C] font-semibold font-mono">
              <span>Last Saved Session:</span>
              <span className="text-[#2251FF]">{lastSaved || 'Pending save...'}</span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onExportBackup}
                className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#2251FF] hover:bg-[#1a3ecb] rounded-[6px] transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_4px_rgba(34,81,255,0.15)]"
              >
                <Download className="w-4 h-4" />
                Export Data Backup (.json)
              </button>

              <div className="relative">
                <input
                  type="file"
                  id="import-file-picker"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <label
                  htmlFor="import-file-picker"
                  className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#051C2C] border border-[#E8E8E6] hover:bg-gray-50 rounded-[6px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import Data Backup (.json)
                </label>
              </div>

              <button
                onClick={() => {
                  if (confirm('Warning! This will clear all custom edits and restore the database to its pristine default demo state. Do you want to proceed?')) {
                    onResetData();
                  }
                }}
                className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 border border-red-200 hover:bg-red-50 rounded-[6px] transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Sandbox Database
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2 & 3: Event Category Multipliers */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <div className="pb-4 border-b border-[#E8E8E6] mb-4">
            <h3 className="font-serif text-lg font-bold text-[#051C2C]">
              Event Category Multipliers (Weights)
            </h3>
            <p className="text-xs text-[#888888] mt-1">
              Custom weight multipliers of event categories. For instance, attending a multi-hour "Workshop" might reflect 1.5x of standard engagement compared to attending a basic "Mixer" (1.0x).
            </p>
          </div>

          {/* Table of multipliers */}
          <div className="overflow-x-auto rounded-[8px] border border-[#E8E8E6]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[rgba(5,28,44,0.04)] border-b-2 border-[rgba(5,28,44,0.12)]">
                  <th className="px-4 py-3 text-left font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em]">
                    Event Type Category
                  </th>
                  <th className="px-4 py-3 text-right font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-48">
                    Multiplier Value
                  </th>
                  <th className="px-4 py-3 text-center font-serif text-[11px] font-semibold text-[#051C2C] uppercase tracking-[0.06em] w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E6]">
                {settings.eventTypes.map((t, idx) => (
                  <tr
                    key={t.type}
                    className={idx % 2 === 0 ? 'bg-[#F5F5F2]/20' : 'bg-white'}
                  >
                    <td className="px-4 py-3.5 text-xs font-semibold text-[#051C2C]">
                      {t.type}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5.0"
                          value={t.weight}
                          onChange={(e) => handleUpdateWeight(t.type, Number(e.target.value))}
                          className="px-2 py-1 text-xs border border-gray-300 rounded bg-[#FFFDE7] w-20 text-right font-mono"
                        />
                        <span className="text-xs text-[#888888] font-mono">x</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteEventType(t.type)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete category weight rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add custom type form */}
          <form onSubmit={handleAddEventType} className="mt-6 p-4 bg-gray-50 rounded-[8px] border border-[#E8E8E6] space-y-4">
            <h4 className="text-xs font-bold text-[#051C2C] uppercase tracking-wider">
              Add Custom Category Weight Rule
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conference, Webinar"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#051C2C] uppercase tracking-wider mb-1">Engagement Multiplier Value</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  required
                  value={newTypeWeight}
                  onChange={(e) => setNewTypeWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-[#E8E8E6] rounded-[6px] bg-[#FFFDE7] text-[#1a1a2e]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#051C2C] hover:bg-black rounded-[4px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category Weight
              </button>
            </div>
          </form>
        </div>

        {/* Text-based Manual Import Area for ultra-portability */}
        <div className="bg-white rounded-[12px] p-6 card-shadow">
          <h3 className="font-serif text-lg font-bold text-[#051C2C] mb-2">Manual Clipboard Backup</h3>
          <p className="text-xs text-[#888888] mb-4">
            No files needed. Simply paste a serialized database string to restore settings and historical ledgers.
          </p>
          <div className="space-y-3">
            <textarea
              rows={4}
              placeholder="Paste serialized JSON here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono border border-[#E8E8E6] rounded-[6px] bg-gray-50 focus:outline-none focus:bg-white text-[#1a1a2e]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!importText}
                onClick={() => {
                  try {
                    onImportBackup(importText);
                    setImportText('');
                    alert('Database imported successfully from pasted backup!');
                  } catch (err) {
                    alert('Invalid database backup string! Please check again.');
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#051C2C] hover:bg-black rounded-[4px] disabled:opacity-50"
              >
                Paste & Restore Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
