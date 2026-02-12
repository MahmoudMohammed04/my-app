'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, ChevronLeft, ChevronRight, User, Award, Medal } from 'lucide-react';
import Image from 'next/image';
import { db } from './connection';

// --- Supabase Functions (As provided by user) ---

const getStudents = db.StudentsTable.getStudents;

const SearchStudentByName = db.StudentsTable.SearchStudentByName;

const SearchStudentByPhone = db.StudentsTable.SearchStudentByPhone;

// --- Components ---

export default function StudentDashboard() {

     // change on tap
  

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Hardcoded GIFs for Top 3
  // Replace these URLs with your actual GIFs
  const rankGifs = {
    1: "https://media.giphy.com/media/yr7n0u3qzO9nG/giphy.gif", // 1st Place
    2: "https://media.tenor.com/mtiOW6O-k8YAAAAM/shrek-shrek-rizz.gif", // 2nd Place
    3: "https://media1.tenor.com/m/z-mrjZu-ff8AAAAd/cat.gif"  // 3rd Place
  };

  const fetchData = async () => {
    setLoading(true);
    let data = [];
    
    try {
      if (!searchQuery.trim()) {
        data = await getStudents(page, pageSize);
      } else {
        // Check if query is numeric (Phone) or text (Name)
        const isNumeric = /^\d+$/.test(searchQuery);
        
        if (isNumeric) {
          data = await SearchStudentByPhone(searchQuery, page, pageSize);
        } else {
          data = await SearchStudentByName(searchQuery, page, pageSize);
        }
      }
      setStudents(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]); // Refetch when page or search changes

  // Handle Search Input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  // Determine Rank (Global Rank approximation based on Page 1)
  // Note: This is a visual approximation. If you need exact global rank for page 2+, 
  // you would need to calculate (page - 1) * pageSize + index + 1
  const getGlobalRank = (index) => {
    return (page - 1) * pageSize + index + 1;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Head>
        <title>Student Leaderboard</title>
      </Head>

      {/* Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Image src = "/community.png" alt = "Community" width = "40" height = "40" />
                Student Dashboard
              </h1>
              <p className="text-slate-500 text-sm mt-1">Track performance and progress</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 sm:text-sm shadow-sm"
                placeholder="Search by Name or Phone..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => {
                const rank = getGlobalRank(index);
                const isTopThree = rank <= 3 && page === 1 && !searchQuery; // Only show GIFs on first page, no search

                return (
                  <div 
                    key={student.student_id} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200 relative overflow-hidden group"
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold 
                      ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                        rank === 2 ? 'bg-slate-200 text-slate-700' : 
                        rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-50 text-slate-400'}`}>
                      #{rank}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Avatar / GIF Area */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                          {isTopThree ? (
                            <img 
                              src={rankGifs[rank]} 
                              alt={`Rank ${rank}`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="text-indigo-300" size={32} />
                          )}
                        </div>
                        {rank <= 3 && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <Medal 
                              size={16} 
                              className={rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : 'text-orange-500'} 
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate">
                          {student.student_name}
                        </h3>
                        
                        {/* Tracks Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                          {student.tracks && student.tracks.length > 0 ? (
                            student.tracks.map((track) => (
                              <span 
                                key={track.id} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                              >
                                {track.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No tracks assigned</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Score</span>
                          <span className="text-xl font-bold text-indigo-600">
                            {student.total_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {students.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="bg-slate-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No students found</h3>
                <p className="text-slate-500">Try adjusting your search terms.</p>
              </div>
            )}

            {/* Pagination */}
            {students.length > 0 && (
              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${page === 1 
                      ? 'text-slate-300 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                
                <span className="text-sm text-slate-600 font-medium">
                  Page {page}
                </span>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={students.length < pageSize}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${students.length < pageSize 
                      ? 'text-slate-300 cursor-not-allowed' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}