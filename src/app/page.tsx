'use client'

import React from 'react';
import { useAuth } from './hooks/useAuth';
import MLAView from './components/mla';
import PAView from './components/pa';
import { LoadingSpinner } from './components/ui/loading';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddScheduleDialog from '../components/AddScheduleDialog';
import { useAppointments } from './hooks/useAppointments';

export default function App() {
  const { isMLA, role } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const { appointments, saveAppointment, updateAppointment, deleteAppointment } = useAppointments();

  if (role === null) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {isMLA ? <MLAView /> : <PAView appointments={appointments} saveAppointment={saveAppointment} updateAppointment={updateAppointment} deleteAppointment={deleteAppointment} />}
      {/* Floating Create Button */}
      <button
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        onClick={() => setShowCreate(true)}
        aria-label="Create Event"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
      {/* Create Dialog */}
      {showCreate && (
        <AddScheduleDialog open={showCreate} onClose={() => setShowCreate(false)} onSave={saveAppointment} />
      )}
    </>
  );
}