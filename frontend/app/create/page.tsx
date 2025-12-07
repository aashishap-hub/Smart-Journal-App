'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Match your FastAPI server address

export default function CreateEntryPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newEntry = { title, content };

        try {
            const response = await fetch(`${API_BASE_URL}/entries/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),
            });

            if (!response.ok) {
                // If the status is not 200/201, throw an error
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create entry');
            }

            // Successful creation: clear the form and redirect to the dashboard
            alert('Entry successfully created!');
            router.push('/'); 

        } catch (error) {
            console.error('Creation Error:', error);
            alert(`Error creating entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Create New Journal Entry</h1>
            
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
                        href="/" 
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
                        {isSubmitting ? 'Creating...' : 'Save Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
}