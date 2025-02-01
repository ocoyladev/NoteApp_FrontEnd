import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';
import { Note, Tag } from '../types';
import { API_URL } from '../configuration/config';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      alert('An error occurred while fetching notes.');
    }
  };



  const handleSaveNote = async ({ title, content, tags }: { title: string; content: string; tags: Tag[] }, id?: string) => {
    console.log("Guardando nota:", title, content, tags, id);
    try {      
      setSelectedNote(null); // Limpia la nota seleccionada
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      alert('An error occurred. Please try again.');
    }
  };

  const handleArchiveNote = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}/archive`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to archive note');
      }
    setNotes(
      notes.map(note =>
        note.id === id ? { ...note, archived: !note.archived} : note
      )
    );
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteNote = async (id: string) => {      
    try {
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Layout showAuthButton onAuthClick={onLogout} isAuthenticated>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <NoteList
              notes={notes}
              onArchive={handleArchiveNote}
              onDelete={handleDeleteNote}
              onSelect={setSelectedNote}
              selectedNoteId={selectedNote?.id}
              setNotes={setNotes}
            />
          </div>
          <div>
            <NoteEditor onSave={handleSaveNote} selectedNote={selectedNote} fetchNotes={fetchNotes}/>
          </div>
        </div>
      </div>
    </Layout>
  );
}