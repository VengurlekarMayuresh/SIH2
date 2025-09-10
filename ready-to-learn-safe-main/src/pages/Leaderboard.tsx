import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Sidebar";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Award,
  Zap,
  Target,
  Clock,
  BarChart3,
  AlertCircle
} from "lucide-react";

interface LeaderboardEntry {
  position: number;
  student: {
    id: string;
    name: string;
    email: string;
    class: string;
    division: string;
  };
  institution: string;
  stats: {
    rankingScore: number;
    averageScore: number;
    totalQuizzes: number;
    totalBadges: number;
    badgePoints: number;
    currentStreak: number;
    perfectScores: number;
  };
  lastActive: string;
  isCurrentUser?: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  studentPosition?: LeaderboardEntry | null;
}

interface StudentRankingDetails {
  student: {
    name: string;
    email: string;
    class: string;
    division: string;
  };
  institution: string;
  overallStats: {
    totalQuizzes: number;
    averageScore: number;
    highestScore: number;
    perfectScores: number;
    totalTimeSpent: number;
    fastestQuizTime: number;
  };
  badgeStats: {
    totalBadges: number;
    badgePoints: number;
    bronzeBadges: number;
    silverBadges: number;
    goldBadges: number;
    platinumBadges: number;
  };
  streakStats: {
    currentStreak: number;
    longestStreak: number;
    totalPassedQuizzes: number;
  };
  rankings: {
    global: { position: number; percentile: number };
    institutional: { position: number; percentile: number };
  };
  rankingScore: number;
}

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [studentRanking, setStudentRanking] = useState<StudentRankingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async (type: 'global' | 'institutional') => {
    try {
      const response = await fetch(`/api/leaderboard/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    }
  };

  // Fetch student ranking details
  const fetchStudentRanking = async () => {
    try {
      const response = await fetch('/api/student/ranking', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student ranking');
      }

      const data = await response.json();
      setStudentRanking(data);
    } catch (err) {
      console.error('Error fetching student ranking:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLeaderboard(activeTab as 'global' | 'institutional'),
        fetchStudentRanking()
      ]);
      setLoading(false);
    };

    loadData();
  }, [activeTab]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{position}</div>;
    }
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
    if (position === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
    if (position === 3) return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
    return 'bg-white border-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <Trophy className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Leaderboard</h1>
            </div>
            
            <Tabs defaultValue="global" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="global">Global Ranking</TabsTrigger>
                <TabsTrigger value="institutional">My Institution</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4 mt-4">
                {[...Array(10)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Alert className="max-w-md mx-auto mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold">Leaderboard</h1>
                <p className="text-gray-600">See how you rank against other students</p>
              </div>
            </div>
          </div>

          {/* Student's Current Ranking Card */}
          {studentRanking && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{studentRanking.rankingScore}</div>
                    <div className="text-sm text-gray-600">Ranking Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{studentRanking.overallStats.averageScore}%</div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{studentRanking.badgeStats.totalBadges}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{studentRanking.streakStats.currentStreak}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">#{studentRanking.rankings.global.position}</div>
                    <div className="text-sm text-gray-600">Global Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">#{studentRanking.rankings.institutional.position}</div>
                    <div className="text-sm text-gray-600">Institution Rank</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Global Ranking
              </TabsTrigger>
              <TabsTrigger value="institutional" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                My Institution
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {/* Full Leaderboard */}
              <div className="space-y-2">
                {leaderboardData?.leaderboard.map((entry, index) => (
                  <Card 
                    key={entry.student.id} 
                    className={`transition-all hover:shadow-md ${
                      entry.isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : getPositionColor(entry.position)
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12">
                            {getRankIcon(entry.position)}
                          </div>
                          
                          <Avatar>
                            <AvatarFallback>
                              {entry.student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className={`font-semibold ${entry.isCurrentUser ? 'text-blue-700' : ''}`}>
                              {entry.student.name}
                              {entry.isCurrentUser && <Badge className="ml-2 text-xs bg-blue-500">You</Badge>}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {entry.student.class} - {entry.student.division}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-lg">{entry.stats.rankingScore}</div>
                            <div className="text-gray-600">Points</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold">{entry.stats.averageScore}%</div>
                            <div className="text-gray-600">Avg Score</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              {entry.stats.totalBadges}
                            </div>
                            <div className="text-gray-600">Badges</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="font-semibold flex items-center gap-1">
                              <Zap className="h-4 w-4 text-orange-500" />
                              {entry.stats.currentStreak}
                            </div>
                            <div className="text-gray-600">Streak</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
