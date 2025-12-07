'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Define the shape of the data we expect for a full entry
interface Entry {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

// Define the shape of the summary response
interface SummaryResponse {
    entry_id: number;
    title: string;
    summary: string;
}

export default function ViewEntryPage() {
    // useParams() extracts the dynamic part of the URL (the ID)
    const params = useParams();
    const entryId = params.id as string;
    const router = useRouter();

    const [entry, setEntry] = useState<Entry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    // --- Fetch Full Entry Details (GET /entries/{id}) ---
    useEffect(() => {
        if (!entryId) return;

        const fetchEntry = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/entries/${entryId}`);
                if (!response.ok) {
                    throw new Error('Entry not found');
                }
                const data: Entry = await response.json();
                setEntry(data);
            } catch (error) {
                console.error("Error fetching entry:", error);
                setEntry(null); // Explicitly set to null if not found
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntry();
    }, [entryId]);

    // --- Request AI Summary (POST /entries/{id}/summary) ---
    const handleGetSummary = async () => {
        setIsSummarizing(true);
        setSummary(null); // Clear previous summary

        try {
            const response = await fetch(`${API_BASE_URL}/entries/${entryId}/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get summary');
            }

            const data: SummaryResponse = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error('Summary Error:', error);
            setSummary(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    // --- Delete Entry (DELETE /entries/{id}) ---
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this entry?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
                method: 'DELETE',
            });

            if (response.status !== 204) { // 204 No Content is the expected success status
                throw new Error('Failed to delete entry');
            }

            alert('Entry successfully deleted!');
            router.push('/'); // Redirect to dashboard after deletion
        } catch (error) {
            console.error('Delete Error:', error);
            alert('Error deleting entry. Check console for details.');
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading entry details...</div>;
    }

    if (!entry) {
        return <div className="p-4 text-center text-red-600">Entry Not Found (ID: {entryId})</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Link href="/" className="text-blue-600 hover:underline mb-4 block">
                &larr; Back to Dashboard
            </Link>

            <h1 className="text-4xl font-extrabold mb-2">{entry.title}</h1>
            <p className="text-sm text-gray-500 mb-6">
                Created: {new Date(entry.created_at).toLocaleString()}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-6">
                <Link 
                    href={`/edit/${entry.id}`} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition duration-200"
                >
                    Edit Entry
                </Link>
                <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200"
                >
                    Delete Entry
                </button>
            </div>

            {/* Entry Content */}
            <div className="prose max-w-none border-t pt-4">
                <p className="whitespace-pre-wrap">{entry.content}</p>
            </div>
            
            <hr className="my-8" />

            {/* AI Summary Section */}
            <h2 className="text-2xl font-bold mb-4">AI Summary</h2>
            <button
                onClick={handleGetSummary}
                disabled={isSummarizing}
                className={`py-2 px-4 rounded transition duration-200 text-white ${
                    isSummarizing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                {isSummarizing ? 'Generating Summary...' : 'Generate Rule-Based Summary'}
            </button>

            {summary && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg border-l-4 border-indigo-500">
                    <p className="font-semibold text-indigo-700">Summary:</p>
                    <p className="text-gray-800 mt-1">{summary}</p>
                </div>
            )}
        </div>
    );
}