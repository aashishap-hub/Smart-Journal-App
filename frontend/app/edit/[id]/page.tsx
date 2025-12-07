'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface Entry {
    id: number;
    title: string;
    content: string;
}

export default function EditEntryPage() {
    const params = useParams();
    const entryId = params.id as string;
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Step 1: Fetch Existing Data (GET /entries/{id}) ---
    useEffect(() => {
        if (!entryId) return;

        const fetchEntry = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/entries/${entryId}`);
                if (!response.ok) {
                    throw new Error('Entry not found');
                }
                const data: Entry = await response.json();
                
                // Pre-fill the form fields with existing data
                setTitle(data.title);
                setContent(data.content);
            } catch (error) {
                console.error("Error fetching entry for edit:", error);
                alert('Could not load entry for editing.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntry();
    }, [entryId]);

    // --- Step 2: Handle Form Submission (PUT /entries/{id}) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // The object sent to PUT is the *entire, final* state of the entry
        const updatedEntry = { title, content };

        try {
            const response = await fetch(`${API_BASE_URL}/entries/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEntry),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update entry');
            }

            alert('Entry successfully updated!');
            router.push(`/view/${entryId}`); // Redirect back to the view page

        } catch (error) {
            console.error('Update Error:', error);
            alert(`Error updating entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Loading entry for editing...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Edit Journal Entry (ID: {entryId})</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Content Textarea */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        id="content"
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <Link 
                        href={`/view/${entryId}`} 
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition duration-150"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ${
                            isSubmitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}