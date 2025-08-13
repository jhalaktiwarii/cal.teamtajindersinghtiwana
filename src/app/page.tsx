 'use client'

import React from 'react';
import { useAuth } from './hooks/useAuth';
import BJYMView from './components/bjym';
import PAView from './components/pa';
import { LoadingSpinner, ErrorBoundary } from './components/ui/loading';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddScheduleDialog from '../components/AddScheduleDialog';
import { useAppointments } from './hooks/useAppointments';

function AppContent() {
  const { isBJYM, role } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const { appointments, saveAppointment, updateAppointment, deleteAppointment } = useAppointments();

  if (role === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isBJYM ? <BJYMView /> : <PAView appointments={appointments} saveAppointment={saveAppointment} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />}
      {/* Floating Create Button */}
      <button
        className="fixed bottom-4 xs:bottom-8 right-4 xs:right-8 z-[70] w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        onClick={() => setShowCreate(true)}
        aria-label="Create Event"
      >
        <Plus className="w-6 h-6 xs:w-8 xs:h-8 text-white" />
      </button>
      {/* Create Dialog */}
      {showCreate && (
        <AddScheduleDialog open={showCreate} onClose={() => setShowCreate(false)} onSave={saveAppointment} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}