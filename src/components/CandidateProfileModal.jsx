"use client";
import { useState } from "react";

export default function CandidateProfileModal({ candidate, isOpen, onClose }) {
  if (!isOpen || !candidate) return null;

  const socialLinks = [
    { name: "LinkedIn", url: candidate.linkedin, icon: "linkedin" },
    { name: "GitHub", url: candidate.github, icon: "github" },
    { name: "Portfolio", url: candidate.portfolio, icon: "globe" },
    { name: "Twitter", url: candidate.twitter, icon: "twitter" },
  ];








  // /thihahodfnd
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 float-right z-10 p-2.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div className="p-8 sm:p-12">
          {/* Header with gradient background */}
          <div className="mb-8 pb-8 border-b-2 border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">{candidate.name}</h2>
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  {candidate.email}
                </a>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ml-4 ${
                candidate.pipelineStatus === 'Hired' ? 'bg-green-100 text-green-800' :
                candidate.pipelineStatus === 'Offer' ? 'bg-yellow-100 text-yellow-800' :
                candidate.pipelineStatus === 'Interview' ? 'bg-purple-100 text-purple-800' :
                candidate.pipelineStatus === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {candidate.pipelineStatus}
              </span>
            </div>
            {candidate.summary && (
              <p className="text-gray-600 leading-relaxed italic mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                "{candidate.summary}"
              </p>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Contact Info */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Contact
              </h3>
              <div className="space-y-3">
                {candidate.phone && (
                  <div className="flex items-center text-gray-700 hover:text-blue-600 transition cursor-pointer">
                    <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 7.985a1 1 0 00.502.756l4.049 2.25a1 1 0 001.053-.855l1.518-8.307a1 1 0 00-.804-1.119L15.5 9"></path>
                    </svg>
                    <a href={`tel:${candidate.phone}`} className="font-medium">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="font-medium">{candidate.location}</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-5 mt-8 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C6.596.75 2.583 3.75 2.583 8.25c0 4.5 4.013 7.5 9.417 12.75c5.404-5.25 9.417-8.25 9.417-12.75 0-4.5-4.013-7.5-9.417-8.25z"></path>
                </svg>
                Education
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{candidate.education || "Not specified"}</p>
              </div>
            </div>

            {/* Experience & Metrics */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                </svg>
                Experience & Background
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Years of Experience</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">{candidate.experienceYears}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Skills</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{candidate.skills.split(',').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-10 pb-10 border-b-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Network & Web Presence
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) =>
                link.url ? (
                  <a
                    key={link.name}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-3 bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 rounded-xl text-gray-700 hover:text-blue-600 transition-all duration-200 font-semibold group"
                  >
                    <span>{link.name}</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                ) : null
              )}
              {!candidate.linkedin && !candidate.github && !candidate.portfolio && !candidate.twitter && (
                <p className="text-gray-500 text-sm italic py-3">No social links found in resume</p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-10 pb-10 border-b-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.split(',').map((skill, idx) => {
                const s = skill.trim();
                if (!s) return null;
                return (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:border-blue-400 transition-all cursor-default"
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Resume Preview */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              Resume Content
            </h3>
            <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-2xl max-h-96 overflow-y-auto font-sans text-sm leading-relaxed">
              {candidate.resumeText ? (
                <div className="space-y-4">
                  {candidate.resumeText.split('\n').map((line, idx) => {
                    const trimmed = line.trim();
                    
                    if (!trimmed) return null;
                    
                    // Check if this is a section header
                    const isSectionHeader = /^(ABOUT|EXPERIENCE|SKILLS|EDUCATION|PROJECTS|LINKS|CONTACT)/.test(trimmed.toUpperCase());
                    
                    if (isSectionHeader) {
                      return (
                        <div key={idx} className="mt-4 pt-3 border-t border-gray-300">
                          <h4 className="font-bold text-blue-600 uppercase tracking-widest text-xs mb-2">
                            {trimmed}
                          </h4>
                        </div>
                      );
                    }
                    
                    // Check if line has email, phone, or link patterns
                    if (trimmed.match(/\S+@\S+\.\S+|^\d{7,}|\d{10}|github|linkedin|http/i)) {
                      return (
                        <div key={idx} className="text-blue-600 font-medium text-xs mb-2">
                          <svg className="w-4 h-4 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                          </svg>
                          {trimmed}
                        </div>
                      );
                    }
                    
                    // Regular text
                    return (
                      <p key={idx} className="text-gray-700 leading-relaxed">
                        {trimmed}
                      </p>
                    );
                  }).filter(Boolean)}
                </div>
              ) : (
                <p className="text-gray-500 italic">No resume content available</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t-2 border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span className="font-medium">
              Added on {new Date(candidate.createdAt).toLocaleDateString()} at {new Date(candidate.createdAt).toLocaleTimeString()}
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
