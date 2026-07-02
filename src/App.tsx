import React, { useState, useEffect } from 'react';
import { Contact, Event, AttendanceLedger, AppSettings } from './types';
import { INITIAL_CONTACTS, INITIAL_EVENTS, INITIAL_SETTINGS, INITIAL_LEDGER } from './seedData';
import { calculateMetrics } from './engine';

import Dashboard from './components/Dashboard';
import ContactsView from './components/ContactsView';
import EventsView from './components/EventsView';
import LedgerView from './components/LedgerView';
import EngineView from './components/EngineView';
import SettingsView from './components/SettingsView';

import { 
  TrendingUp, 
  Users, 
  Calendar, 
  BookOpen, 
  Compass, 
  Settings as SettingsIcon,
  Download,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';

const LOCAL_STORAGE_KEY_PREFIX = 'membership_workbook_';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core database states
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ledger, setLedger] = useState<AttendanceLedger[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [lastSaved, setLastSaved] = useState<string>('');

  // 1. Initial Database Loading
  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}contacts`);
      const storedEvents = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}events`);
      const storedLedger = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}ledger`);
      const storedSettings = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}settings`);
      const storedLastSaved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}last_saved`);

      if (storedContacts && storedEvents && storedLedger && storedSettings) {
        setContacts(JSON.parse(storedContacts));
        setEvents(JSON.parse(storedEvents));
        setLedger(JSON.parse(storedLedger));
        setSettings(JSON.parse(storedSettings));
        setLastSaved(storedLastSaved || new Date().toLocaleTimeString());
      } else {
        // First load, load seed data
        setContacts(INITIAL_CONTACTS);
        setEvents(INITIAL_EVENTS);
        setLedger(INITIAL_LEDGER);
        setSettings(INITIAL_SETTINGS);
        
        const nowStr = new Date().toLocaleTimeString();
        setLastSaved(nowStr);
        
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}contacts`, JSON.stringify(INITIAL_CONTACTS));
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}events`, JSON.stringify(INITIAL_EVENTS));
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}ledger`, JSON.stringify(INITIAL_LEDGER));
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}settings`, JSON.stringify(INITIAL_SETTINGS));
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}last_saved`, nowStr);
      }
    } catch (e) {
      console.error('Failed to load database from localStorage, initializing default state.', e);
      setContacts(INITIAL_CONTACTS);
      setEvents(INITIAL_EVENTS);
      setLedger(INITIAL_LEDGER);
      setSettings(INITIAL_SETTINGS);
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, []);

  // 2. Auto-saving Effect
  const saveToLocalStorage = (
    updatedContacts: Contact[],
    updatedEvents: Event[],
    updatedLedger: AttendanceLedger[],
    updatedSettings: AppSettings
  ) => {
    try {
      const nowStr = new Date().toLocaleTimeString();
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}contacts`, JSON.stringify(updatedContacts));
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}events`, JSON.stringify(updatedEvents));
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}ledger`, JSON.stringify(updatedLedger));
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}settings`, JSON.stringify(updatedSettings));
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}last_saved`, nowStr);
      setLastSaved(nowStr);
    } catch (e) {
      console.error('Auto-save error', e);
    }
  };

  // State mutation wrappers to guarantee instant auto-save and state sync
  const updateContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    saveToLocalStorage(newContacts, events, ledger, settings);
  };

  const updateEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    saveToLocalStorage(contacts, newEvents, ledger, settings);
  };

  const updateLedger = (newLedger: AttendanceLedger[]) => {
    setLedger(newLedger);
    saveToLocalStorage(contacts, events, newLedger, settings);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveToLocalStorage(contacts, events, ledger, newSettings);
  };

  // 3. Real-time engine calculation based on updated database states
  const metrics = calculateMetrics(contacts, events, ledger, settings);

  // 4. Backups, Reset and Restores
  const handleExportBackup = () => {
    const fullState = {
      contacts,
      events,
      ledger,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(fullState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `membership_workbook_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.contacts && parsed.events && parsed.ledger && parsed.settings) {
        setContacts(parsed.contacts);
        setEvents(parsed.events);
        setLedger(parsed.ledger);
        setSettings(parsed.settings);
        saveToLocalStorage(parsed.contacts, parsed.events, parsed.ledger, parsed.settings);
        alert('Database backup restored successfully!');
      } else {
        alert('Invalid database format. Missing required modules.');
      }
    } catch (e) {
      alert('Failed to parse backup string. Make sure it is valid JSON.');
      throw e;
    }
  };

  const handleResetData = () => {
    setContacts(INITIAL_CONTACTS);
    setEvents(INITIAL_EVENTS);
    setLedger(INITIAL_LEDGER);
    setSettings(INITIAL_SETTINGS);
    saveToLocalStorage(INITIAL_CONTACTS, INITIAL_EVENTS, INITIAL_LEDGER, INITIAL_SETTINGS);
  };

  // 5. Shared Contact Database Updates
  const handleAddContact = (newContact: Contact) => {
    updateContacts([...contacts, newContact]);
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    const updated = contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c));
    updateContacts(updated);
  };

  const handleDeleteContact = (id: string) => {
    const updatedContacts = contacts.filter((c) => c.id !== id);
    const updatedLedger = ledger.filter((l) => l.contactId !== id);
    setContacts(updatedContacts);
    setLedger(updatedLedger);
    saveToLocalStorage(updatedContacts, events, updatedLedger, settings);
  };

  // 6. Shared Event Database Updates
  const handleAddEvent = (newEvent: Event) => {
    updateEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    const updated = events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
    updateEvents(updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter((e) => e.id !== id);
    const updatedLedger = ledger.filter((l) => l.eventId !== id);
    setEvents(updatedEvents);
    setLedger(updatedLedger);
    saveToLocalStorage(contacts, updatedEvents, updatedLedger, settings);
  };

  // 7. Shared Ledger Updates
  const handleAddLedger = (newEntry: AttendanceLedger) => {
    updateLedger([...ledger, newEntry]);
  };

  const handleAddLedgers = (newEntries: AttendanceLedger[]) => {
    updateLedger([...ledger, ...newEntries]);
  };

  const handleUpdateLedger = (updatedEntry: AttendanceLedger) => {
    const updated = ledger.map((l) => (l.id === updatedEntry.id ? updatedEntry : l));
    updateLedger(updated);
  };

  const handleDeleteLedger = (id: string) => {
    const updated = ledger.filter((l) => l.id !== id);
    updateLedger(updated);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#1A1A2E] flex flex-col font-sans">
      {/* Horizontal Sticky Top Navigation (56px) */}
      <header className="sticky top-0 z-50 h-[56px] bg-white border-b border-[#E8E8E6] shadow-[0_1px_3px_rgba(5,28,44,0.06)] px-4 sm:px-10 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#051C2C] rounded-[6px] flex items-center justify-center text-white font-serif font-bold text-sm tracking-tight shadow-sm">
            M
          </div>
          <span className="font-serif text-lg font-bold text-[#051C2C] tracking-tight">
            Membership Analytics Workbook
          </span>
        </div>

        {/* Tab Switcher - Navigation links */}
        <nav className="hidden md:flex h-full items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Contacts Master
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events Master
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'ledger'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Attendance Ledger
          </button>
          <button
            onClick={() => setActiveTab('engine')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'engine'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Formula Engine
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`h-full px-4 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-[#2251FF] text-[#2251FF]'
                : 'border-transparent text-[#051C2C]/60 hover:text-[#051C2C]'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            Settings
          </button>
        </nav>

        {/* Right side live stats: Last saved & quick exporter */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#888888] bg-gray-50 border border-[#E8E8E6] px-2.5 py-1 rounded-[6px]">
            <Clock className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>Last Saved:</span>
            <span className="font-mono font-semibold text-[#051C2C]">{lastSaved || 'Autosaving...'}</span>
          </div>
          <button
            onClick={handleExportBackup}
            title="Download full database backup"
            className="p-2 border border-gray-200 hover:bg-gray-100 rounded-[6px] transition-colors md:hidden"
          >
            <Download className="w-4 h-4 text-[#051C2C]" />
          </button>
        </div>
      </header>

      {/* Mobile Top Navigation Subbar */}
      <div className="md:hidden bg-white border-b border-[#E8E8E6] px-4 py-2 overflow-x-auto flex gap-1.5 scrollbar-none scroll-smooth">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'dashboard' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'contacts' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Contacts
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'events' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'ledger' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => setActiveTab('engine')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'engine' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Engine
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
            activeTab === 'settings' ? 'bg-[#051C2C] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Main Container Area with 1400px Max Width and 40px padding */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-10 py-8">
        <div className="animate-fade-up">
          {activeTab === 'dashboard' && (
            <Dashboard
              contacts={contacts}
              events={events}
              ledger={ledger}
              settings={settings}
              metrics={metrics}
              onUpdateContacts={updateContacts}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              events={events}
              ledger={ledger}
              metrics={metrics}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              events={events}
              contacts={contacts}
              ledger={ledger}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerView
              ledger={ledger}
              contacts={contacts}
              events={events}
              onAddLedger={handleAddLedger}
              onAddLedgers={handleAddLedgers}
              onUpdateLedger={handleUpdateLedger}
              onDeleteLedger={handleDeleteLedger}
            />
          )}

          {activeTab === 'engine' && (
            <EngineView
              contacts={contacts}
              events={events}
              ledger={ledger}
              settings={settings}
              metrics={metrics}
              onUpdateWeights={(w) => updateSettings({ ...settings, weights: w })}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              lastSaved={lastSaved}
              onUpdateSettings={updateSettings}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetData={handleResetData}
            />
          )}
        </div>
      </main>

      {/* Footer Block */}
      <footer className="bg-white border-t border-[#E8E8E6] py-6 text-center text-xs text-[#888888] px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#2251FF]" />
            <span>Operational Relationship & Engagement Analyser Workbook</span>
          </div>
          <div>
            Built with <strong>React + Vite + Tailwind v4</strong> · Fully Offline Sandbox Mode
          </div>
        </div>
      </footer>
    </div>
  );
}
