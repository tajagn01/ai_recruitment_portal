"use client";
import { useState } from "react";
import axios from "axios";

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [duplicateWarnings, setDuplicateWarnings] = useState([]);

    if (!isOpen) return null;
// fsoihfweiof
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setIsUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                const duplicates = (res.data.dedupeResults || []).filter(d => d.skippedAsDuplicate);
                if (duplicates.length > 0) {
                    setDuplicateWarnings(duplicates);
                } else {
                    onUploadSuccess(res.data.candidate);
                    onClose();
                }
            }
        } catch (err) {
            console.error(err);
            setError("Failed to upload and parse resume.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Upload Resume</h2>
                    <p className="text-blue-100">PDF files are automatically parsed and analyzed</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {duplicateWarnings.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-yellow-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold text-yellow-700">Duplicate Resume Detected</span>
                            </div>
                            {duplicateWarnings.map((d, idx) => (
                                <div key={idx} className="text-sm mb-2 last:mb-0">
                                    <p className="font-semibold">{d.name}</p>
                                    {d.similarityPercentage != null && (
                                        <p className="text-yellow-700">{Math.round(d.similarityPercentage)}% similar to an existing candidate</p>
                                    )}
                                    {d.matchedCandidateEmail && (
                                        <p className="text-yellow-600">Matches: {d.matchedCandidateEmail}</p>
                                    )}
                                    <p className="text-yellow-600 mt-1">This resume was not uploaded — it already exists in the system.</p>
                                </div>
                            ))}
                            <button
                                onClick={onClose}
                                className="mt-3 text-xs font-semibold text-yellow-700 underline"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start">
                            <svg className="w-5 h-5 mr-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpload}>
                        {/* File Drop Zone */}
                        <label className="block w-full border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                </div>
                                <span className="font-semibold text-gray-900 text-lg">
                                    {file ? (
                                        <span className="text-blue-600 flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {file.name}
                                        </span>
                                    ) : (
                                        "Drop here or click to select"
                                    )}
                                </span>
                                {!file && <p className="text-sm text-gray-500 mt-2">PDF files only • Max 10MB</p>}
                            </div>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                    setFile(e.target.files[0]);
                                    setError("");
                                }}
                            />
                        </label>

                        {/* Features Info */}
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <svg className="w-5 h-5 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                                <p className="text-xs font-medium text-gray-700">Extract Info</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <svg className="w-5 h-5 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs font-medium text-gray-700">Fast Parse</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUploading}
                                className="flex-1 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading || !file}
                                className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-hover"
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Parsing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"></path>
                                        </svg>
                                        <span>Upload & Parse</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
