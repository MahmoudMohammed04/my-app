'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Search, ChevronLeft, ChevronRight, User, Filter } from 'lucide-react';
import Image from 'next/image';
import { db } from './connection';

// --- Supabase Functions ---
const getStudents = db.StudentsTable.getStudents;
const SearchStudentByName = db.StudentsTable.SearchStudentByName;
const SearchStudentByPhone = db.StudentsTable.SearchStudentByPhone;
const getStudentsByTrack = db.StudentsTable.getStudentsByTrack;
const getTracks = db.TracksTable.getTracks;

// --- Enhanced Cosmic Dust Particle System with Movement ---
const CosmicDust = ({ color, rank }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: `${rank}-${i}`,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      driftX: (Math.random() - 0.5) * 100,
      driftY: -Math.random() * 120 - 30,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
  }, [rank]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <React.Fragment key={p.id}>
          {/* Unique keyframe for this particle */}
          <style>{`
            @keyframes move-${p.id} {
              0% {
                opacity: 0;
                transform: translate(0, 0) scale(0);
              }
              10% {
                opacity: 1;
                transform: translate(0, 0) scale(1);
              }
              90% {
                opacity: 0.4;
                transform: translate(${p.driftX}px, ${p.driftY}px) scale(0.6);
              }
              100% {
                opacity: 0;
                transform: translate(${p.driftX}px, ${p.driftY - 20}px) scale(0);
              }
            }
          `}</style>
          <div
            className="absolute rounded-full"
            style={{
              left: `${p.startX}%`,
              top: `${p.startY}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${p.size * 4}px ${p.size * 2}px ${color}, 0 0 ${p.size * 8}px ${p.size * 4}px ${color}40`,
              animation: `move-${p.id} ${p.duration}s ease-out ${p.delay}s infinite`,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Floating Orbs for Extra Effect ---
const FloatingOrbs = ({ color }) => {
  const orbs = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full animate-orb-float blur-xl"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.startX}%`,
            top: `${orb.startY}%`,
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const rankConfig = {
    1: {
      img: "/Gold.png",
      particleColor: "#FFD700",
      accent: "text-yellow-400",
      glow: "shadow-yellow-500/30",
      border: "border-yellow-500/50",
    },
    2: {
      img: "/Silver.png",
      particleColor: "#E8E8E8",
      accent: "text-slate-200",
      glow: "shadow-slate-400/30",
      border: "border-slate-400/50",
    },
    3: {
      img: "/Bronze.png",
      particleColor: "#CD7F32",
      accent: "text-orange-400",
      glow: "shadow-orange-500/30",
      border: "border-orange-500/50",
    },
  };

  useEffect(() => {
    const fetchTracks = async () => {
      const data = await getTracks();
      setTracks(data || []);
    };
    fetchTracks();
  }, []);

  const normalizeStudentData = (rawData) => {
    return rawData.map((item) => {
      if (item.tracks_students) {
        return {
          student_id: item.id,
          student_name: item.name,
          total_score: item.total_score,
          tracks: item.tracks_students.map((ts) => ts.tracks),
        };
      }
      return item;
    });
  };

  const fetchData = async () => {
    setLoading(true);
    let data = [];

    try {
      if (selectedTrack) {
        data = await getStudentsByTrack(selectedTrack, page, pageSize);
      } else if (!searchQuery.trim()) {
        data = await getStudents(page, pageSize);
      } else {
        const isNumeric = /^\d+$/.test(searchQuery);
        if (isNumeric) {
          data = await SearchStudentByPhone(searchQuery, page, pageSize);
        } else {
          data = await SearchStudentByName(searchQuery, page, pageSize);
        }
      }

      setStudents(normalizeStudentData(data));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery, selectedTrack]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setSelectedTrack('');
  };

  const handleTrackChange = (e) => {
    setSelectedTrack(e.target.value);
    setPage(1);
    setSearchQuery('');
  };

  const getGlobalRank = (index) => {
    return (page - 1) * pageSize + index + 1;
  };

  const shouldShowTopThree = page === 1 && !searchQuery;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Head>
        <title>Student Leaderboard</title>
        <style>{`
          @keyframes cosmic-dust {
            0% {
              opacity: 0;
              transform: translate(0, 0) scale(0);
            }
            15% {
              opacity: 1;
              transform: translate(0, 0) scale(1);
            }
            85% {
              opacity: 0.6;
              transform: translate(var(--drift-x), var(--drift-y)) scale(0.8);
            }
            100% {
              opacity: 0;
              transform: translate(var(--drift-x), calc(var(--drift-y) - 20px)) scale(0);
            }
          }
          .animate-cosmic-dust {
            animation-name: cosmic-dust;
            animation-iteration-count: infinite;
            animation-timing-function: ease-out;
          }
          
          @keyframes orb-float {
            0%, 100% {
              opacity: 0.3;
              transform: translate(0, 0) scale(1);
            }
            50% {
              opacity: 0.6;
              transform: translate(20px, -30px) scale(1.2);
            }
          }
          .animate-orb-float {
            animation-name: orb-float;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
          }
        `}</style>
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/community.png"
                  alt="Community"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Student Dashboard
                </h1>
                <p className="text-slate-500 text-sm">
                  Track performance and progress
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Track Filter */}
              <div className="relative min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={selectedTrack}
                  onChange={handleTrackChange}
                  className="block w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none cursor-pointer"
                >
                  <option value="">All Tracks</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  placeholder="Name or Phone..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student, index) => {
                const rank = getGlobalRank(index);
                const isTopThree = rank <= 3 && shouldShowTopThree;
                const config = rankConfig[rank];

                return (
                  <div
                    key={student.student_id}
                    className={`relative rounded-2xl p-6 transition-all duration-300 overflow-hidden
                      ${
                        isTopThree
                          ? `bg-black ${config.glow} shadow-2xl text-white ${config.border} border-2`
                          : "bg-white border border-slate-100 hover:shadow-lg text-slate-900"
                      }`}
                  >
                    {/* Background Effects for Top 3 */}
                    {isTopThree && (
                      <>
                        {/* Floating Orbs - Large Glow Areas */}
                        <FloatingOrbs color={config.particleColor} />
                        
                        {/* Cosmic Dust Particles */}
                        <CosmicDust color={config.particleColor} rank={rank} />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      </>
                    )}

                    {/* Rank Badge */}
                    <div
                      className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold z-20 backdrop-blur-md
                      ${
                        isTopThree
                          ? `bg-white/20 ${config.accent} border-2 ${config.border} shadow-lg`
                          : rank === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : rank === 2
                          ? "bg-slate-200 text-slate-700"
                          : rank === 3
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {rank}
                    </div>

                    <div className="flex items-start gap-4 relative z-10">
                      {/* Avatar Area */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-4 transition-transform hover:scale-110
                          ${
                            isTopThree
                              ? `${config.border} bg-gradient-to-br from-gray-800 to-black shadow-2xl`
                              : "bg-indigo-50 border-white shadow-lg"
                          }`}
                        >
                          {isTopThree ? (
                            <Image
                              src={config.img}
                              alt={`Rank ${rank}`}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          ) : (
                            <User
                              className={
                                isTopThree
                                  ? "text-white/70"
                                  : "text-indigo-300"
                              }
                              size={40}
                            />
                          )}
                        </div>
                        
                        {/* Pulsing Ring Effect */}
                        {isTopThree && (
                          <div 
                            className="absolute inset-0 rounded-full animate-ping opacity-40"
                            style={{ 
                              border: `3px solid ${config.particleColor}`,
                              animationDuration: '2s'
                            }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3
                          className={`text-xl font-bold truncate ${
                            isTopThree ? "text-white drop-shadow-lg" : "text-slate-900"
                          }`}
                        >
                          {student.student_name}
                        </h3>

                        {/* Tracks Tags */}
                        <div className="flex flex-wrap gap-2 mt-3 mb-4">
                          {student.tracks && student.tracks.length > 0 ? (
                            student.tracks.map((track) => (
                              <span
                                key={track.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-all hover:scale-105
                                  ${
                                    isTopThree
                                      ? `bg-white/10 ${config.accent} border-white/30`
                                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  }`}
                              >
                                {track.name}
                              </span>
                            ))
                          ) : (
                            <span
                              className={`text-xs italic ${
                                isTopThree
                                  ? "text-white/50"
                                  : "text-slate-400"
                              }`}
                            >
                              No tracks assigned
                            </span>
                          )}
                        </div>

                        <div
                          className={`flex items-center justify-between mt-2 pt-3 border-t 
                          ${
                            isTopThree
                              ? "border-white/20"
                              : "border-slate-100"
                          }`}
                        >
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider
                            ${isTopThree ? "text-white/60" : "text-slate-400"}`}
                          >
                            Total Score
                          </span>
                          <span
                            className={`text-3xl font-bold ${
                              isTopThree ? config.accent : "text-indigo-600"
                            }`}
                          >
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
                <h3 className="text-lg font-medium text-slate-900">
                  No students found
                </h3>
                <p className="text-slate-500">
                  Try adjusting your search or filter.
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    page === 1
                      ? "text-slate-300 cursor-not-allowed bg-transparent"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200 shadow-sm"
                  }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span className="text-sm text-slate-600 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                Page {page}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={students.length < pageSize}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    students.length < pageSize
                      ? "text-slate-300 cursor-not-allowed bg-transparent"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200 shadow-sm"
                  }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}