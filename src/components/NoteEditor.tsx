import React, { useState, useEffect } from 'react';
import { Save, Tag } from 'lucide-react';
import { Note, Tag as Tg } from '../types';
import { API_URL } from '../configuration/config';

interface NoteEditorProps {
  onSave: (note: { title: string; content: string; tags: Tg[] }, id?: string) => Promise<void>;
  selectedNote: Note | null;
  fetchNotes: () => Promise<void>;
}


export function NoteEditor({ onSave, selectedNote, fetchNotes }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<Tg[]>([]);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags(selectedNote?.tags?.map(tag => ({ id: tag.id, name: tag.name })) ?? []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
  }, [selectedNote]);

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();

      try {

        // Verifica si la etiqueta ya existe
      const existingTagResponse = await fetch(`${API_URL}/tags?name=${tagInput.trim()}`);
      // if (!existingTagResponse.ok) {
      //   throw new Error(`Failed to check existing tags: ${existingTagResponse.statusText}`);
      // }

      const existingTags = await existingTagResponse.json();
      let tagId: string;

      if (existingTags.length > 0) {
        // Usa la etiqueta existente
        tagId = existingTags[0].id;
        console.log("Etiqueta existente encontrada:", existingTags[0]);
      } else {
        // Crea una nueva etiqueta
        const tagResponse = await fetch(`${API_URL}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: tagInput.trim() }),
        });

        if (!tagResponse.ok) {
          throw new Error(`Failed to create tag: ${tagResponse.statusText}`);
        }

        const createdTag = await tagResponse.json();
        tagId = createdTag.id;
        console.log("Nueva etiqueta creada:", createdTag);
      }

      // Agrega la etiqueta a la lista de tags con su ID y nombre
      setTags([...tags, { id: tagId, name: tagInput.trim() }]);
      setTagInput(''); // Limpia el campo de entrada

      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        alert('An error occurred while adding the tag. Please try again.');
      }
      
    }
  };

  const handleRemoveTag = async(tagId: string) => {
    try {
      // Elimina el tag localmente
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      alert('An error occurred while removing the tag. Please try again.');
    }


    // setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (title.trim() && content.trim()) {
      setLoading(true); // Activa el indicador de carga
      try {
        // Guardar la nota en el backend
        console.log("datos a guardar:", { title, content, tags });
        const noteResponse = await fetch(
          selectedNote ? `${API_URL}/notes/${selectedNote.id}` : `${API_URL}/notes`,
          {
            method: selectedNote ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content, tags }),
          }
        );  
        if (!noteResponse.ok) {
          throw new Error('Failed to save note');
        }        
        const savedNote = await noteResponse.json();

        // Actualiza el estado en el componente padre
        onSave(savedNote, savedNote.id);
        fetchNotes();

        // Limpia el formulario si es una nueva nota
        if (!selectedNote) {
          setTitle('');
          setContent('');
          setTags([]);
        }

      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        alert('An error occurred. Please try again.');
      } finally {
        setLoading(false); // Desactiva el indicador de carga
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <input
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-semibold border-b border-gray-200 pb-2 focus:outline-none focus:border-indigo-500"
      />
      <textarea
        placeholder="Start writing your note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 resize-none focus:outline-none"
      />
      <div className="flex items-center space-x-2">
        <Tag className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Add tags (press Enter)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="flex-1 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          
          <span
            key={index}
            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        <Save className="h-4 w-4 mr-2" />
        {selectedNote ? 'Update Note' : 'Save Note'}
      </button>
    </div>
  );
}