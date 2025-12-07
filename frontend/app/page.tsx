'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Entry {
    id: number;
    title: string;
    created_at: string;
}

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function DashboardPage() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [idSearch, setIdSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchEntries = async () => {
        setIsLoading(true);
        const url = `${API_BASE_URL}/entries/${searchQuery ? `?search=${searchQuery}` : ''}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch entries');
            }
            const data = await response.json();
            setEntries(data);
        } catch (error) {
            console.error("Error fetching entries:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIdSearch = () => {
        const id = parseInt(idSearch);
        if (isNaN(id) || id <= 0) {
            alert("Please enter a valid Entry ID number.");
            return;
        }
        router.push(`/view/${id}`);
    };

    useEffect(() => {
        fetchEntries();
    }, [searchQuery]);

    return (
        <div className="container mx-auto p-8 max-w-4xl bg-gray-800 shadow-xl rounded-xl mt-10">
            <h1 className="text-4xl font-extrabold text-white mb-8 flex justify-between items-center border-b border-gray-700 pb-4">
                Smart Journal Dashboard
                <Link 
                    href="/create" 
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-5 rounded-full text-lg shadow-md transition duration-300"
                >
                    + New Entry
                </Link>
            </h1>

            {/* --- Search and ID Lookup Section --- */}
            <div className="flex space-x-4 mb-16"> 
                <input
                    type="text"
                    placeholder="Search by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-6 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-gray-700 text-white placeholder-gray-400"
                />

                <div className="flex space-x-2 items-center w-auto"> 
                    <input
                        type="number"
                        placeholder="ID"
                        value={idSearch}
                        onChange={(e) => setIdSearch(e.target.value)}
                        className="p-3 border border-gray-600 rounded-lg w-20 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-700 text-white placeholder-gray-400"
                    />
                    <button
                        onClick={handleIdSearch}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white py-6 px-4 rounded-lg transition duration-200 shadow-md"
                    >
                        Go
                    </button>
                </div>
            </div>
            
            {/* Display Loading or Entries */}
            {isLoading ? (
                <p className="text-center text-gray-400 py-10">Loading entries...</p>
            ) : entries.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No entries found. Start by creating a new one!</p>
            ) : (
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <div 
                            key={entry.id} 
                            className="p-10 border border-gray-700 bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex justify-between items-center"
                        >
                            {/* Entry Details */}
                            <div className='truncate'>
                                <Link 
                                    href={`/view/${entry.id}`} 
                                    className="text-5xl font-semibold text-blue-400 hover:text-blue-300 hover:underline block truncate max-w-sm sm:max-w-md"
                                >
                                    {entry.title}
                                </Link>
                                <p className="text-xxs text-gray-400 mt-1">
                                    Entry ID: {entry.id} | Created: {new Date(entry.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            
                            {/* Action Button */}
                            <Link 
                                href={`/edit/${entry.id}`} 
                                className="text-sm bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded-lg shadow transition duration-200 flex-shrink-0"
                            >
                                Edit
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}