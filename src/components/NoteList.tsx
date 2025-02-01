  import { useEffect, useState } from 'react';
  import { Search, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
  import { Note } from '../types';
  import { API_URL } from '../configuration/config';

  interface NoteListProps {
    notes: Note[];
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
    onSelect: (note: Note) => void;
    selectedNoteId?: string;
    setNotes: (notes: Note[]) => void;
  }

  export function NoteList({ notes, onArchive, onDelete, onSelect, selectedNoteId, setNotes }: NoteListProps) {
    const [search, setSearch] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetchNotes();
    }, []); // Se ejecuta al montar el componente

    const fetchNotes = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/notes`);
          if (!response.ok) {
            throw new Error('Failed to fetch notes');
          }
          const data = await response.json();
          setNotes(data); // Actualizar el estado global de las notas
        } catch (error) {
          console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
          alert('An error occurred while fetching notes.');
        } finally {
          setLoading(false);
        }
      };


    const filteredNotes = notes
    .filter((note) => note.archived === showArchived)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });


      
    const handleArchive = async (id: string, archived: boolean) => {    
      setLoading(true);
      console.log('id:', id, archived);
      try {
        let response;
    
        if (archived) {
          response = await fetch(`${API_URL}/notes/${id}/unarchive`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } else {
          response = await fetch(`${API_URL}/notes/${id}/archive`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ archived: true }),
          });
        }

        if (!response.ok) {
          throw new Error(archived ? 'Failed to unarchive note' : 'Failed to archive note');
        }

      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        alert('An error occurred. Please try again.');
      } finally {
        fetchNotes()
        setLoading(false); // Desactiva el indicador de carga
      }    
    }
    
    const handleDelete = async (id: string) => {
      setLoading(true); // Activa el indicador de carga
      try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }
        
        // onDelete(id); // Actualiza el estado en el componente padre
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        alert('An error occurred. Please try again.');
      } finally {
        fetchNotes()
        setLoading(false); // Desactiva el indicador de carga
      }
      
    }
    
    const handleSearch = async (query: string) => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/notes/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        setNotes(data);

      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
        alert('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const useDebounce = (value: string, delay: number) => {
      const [debouncedValue, setDebouncedValue] = useState(value);
    
      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
    
        return () => {
          clearTimeout(handler);
        };
      }, [value, delay]);
    
      return debouncedValue;
    };

    const debouncedSearch = useDebounce(search, 500); // 500ms de retraso

    useEffect(() => {
      handleSearch(debouncedSearch);
    }, [debouncedSearch]);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);            
                handleSearch(e.target.value)}
              }
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {showArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-1" /> Show Active
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-1" /> Show Archived
                </>
              )}
            </button>
            {/* <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
              className="text-sm border rounded-md px-2 py-1"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select> */}
          </div>
        </div>
        <div className="divide-y">
        {filteredNotes.length === 0 && search.trim() !== '' ? (
          <div className="p-4 text-center text-gray-500">
            No results found for "{search}".
          </div>
        ) : (
          
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedNoteId === note.id ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onSelect(note)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content.length > 50 ? `${note.content.slice(0, 50)}...` : note.content}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(note.id, note.archived)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {note.archived ? (
                      <ArchiveRestore className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Archive className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              {/* <p className="text-xs text-gray-500 mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </p> */}
            </div>
          )))}
        </div>        
      </div>
    );
  }