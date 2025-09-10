import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Award,
  Star,
  Medal,
  Crown,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Lock,
  Gift
} from "lucide-react";

interface EarnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  earnedAt: string;
  context: {
    scoreAchieved?: number;
    timeSpent?: number;
    streakNumber?: number;
    moduleId?: string;
  };
}

interface AvailableBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  isEarned: boolean;
  criteria: {
    quizCount?: number;
    minScore?: number;
    maxTime?: number;
    streakCount?: number;
    moduleCount?: number;
    perfectScore?: boolean;
    consecutivePerfect?: number;
  };
}

interface BadgeStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byRarity: Record<string, number>;
  totalPoints: number;
  recentBadges: EarnedBadge[];
}

interface BadgeCollectionData {
  badges: EarnedBadge[];
  stats: BadgeStats;
}

const BadgeCollection = () => {
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('earned');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch earned badges
  const fetchEarnedBadges = async () => {
    try {
      const response = await fetch('/api/student/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch earned badges');
      }

      const data: BadgeCollectionData = await response.json();
      setEarnedBadges(data.badges);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load badges');
    }
  };

  // Fetch available badges
  const fetchAvailableBadges = async () => {
    try {
      const response = await fetch('/api/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available badges');
      }

      const data: AvailableBadge[] = await response.json();
      setAvailableBadges(data);
    } catch (err) {
      console.error('Error fetching available badges:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEarnedBadges(),
        fetchAvailableBadges()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const getBadgeTypeIcon = (type: string) => {
    switch (type) {
      case 'bronze': return <Medal className="h-4 w-4 text-amber-600" />;
      case 'silver': return <Medal className="h-4 w-4 text-gray-400" />;
      case 'gold': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'diamond': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBadgeTypeColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'from-amber-100 to-amber-200 border-amber-300';
      case 'silver': return 'from-gray-100 to-gray-200 border-gray-300';
      case 'gold': return 'from-yellow-100 to-yellow-200 border-yellow-300';
      case 'platinum': return 'from-purple-100 to-purple-200 border-purple-300';
      case 'diamond': return 'from-blue-100 to-blue-200 border-blue-300';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quiz_completion': return <BookOpen className="h-4 w-4" />;
      case 'high_achiever': return <Trophy className="h-4 w-4" />;
      case 'speed_demon': return <Zap className="h-4 w-4" />;
      case 'perfectionist': return <Target className="h-4 w-4" />;
      case 'streak_master': return <TrendingUp className="h-4 w-4" />;
      case 'explorer': return <Users className="h-4 w-4" />;
      case 'safety_expert': return <Award className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getCategories = () => {
    const categories = ['all'];
    if (activeTab === 'earned') {
      categories.push(...new Set(earnedBadges.map(badge => badge.category)));
    } else {
      categories.push(...new Set(availableBadges.map(badge => badge.category)));
    }
    return categories;
  };

  const filterBadgesByCategory = (badges: (EarnedBadge | AvailableBadge)[]) => {
    if (selectedCategory === 'all') return badges;
    return badges.filter(badge => badge.category === selectedCategory);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Badge Collection</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-6 w-16 mx-auto mb-1" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-16 mx-auto mb-4" />
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const filteredEarnedBadges = filterBadgesByCategory(earnedBadges) as EarnedBadge[];
  const filteredAvailableBadges = filterBadgesByCategory(availableBadges) as AvailableBadge[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Badge Collection</h1>
            <p className="text-gray-600">Your achievements and progress</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Badges</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">Badge Points</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.byType.gold || 0}</div>
              <div className="text-sm text-gray-600">Gold Badges</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.recentBadges.length}</div>
              <div className="text-sm text-gray-600">Recent Badges</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Badge Collection Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="earned" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Earned ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Available ({availableBadges.filter(b => !b.isEarned).length})
            </TabsTrigger>
          </TabsList>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Earned Badges Tab */}
        <TabsContent value="earned" className="space-y-6">
          {filteredEarnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredEarnedBadges.map((badge) => (
                <Card key={badge.id} className={`bg-gradient-to-br ${getBadgeTypeColor(badge.type)} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{badge.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {getBadgeTypeIcon(badge.type)}
                      <Badge className={getRarityColor(badge.rarity)} variant="outline">
                        {badge.rarity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-medium">{badge.points}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Earned:</span>
                        <span className="font-medium">{formatDate(badge.earnedAt)}</span>
                      </div>
                      
                      {badge.context.scoreAchieved && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Score:</span>
                          <span className="font-medium">{badge.context.scoreAchieved}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No badges earned yet</h3>
              <p className="text-gray-500">Complete quizzes and challenges to earn your first badges!</p>
            </div>
          )}
        </TabsContent>

        {/* Available Badges Tab */}
        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAvailableBadges.map((badge) => (
              <Card key={badge.id} className={`${
                badge.isEarned 
                  ? `bg-gradient-to-br ${getBadgeTypeColor(badge.type)} opacity-75` 
                  : 'border-2 border-dashed hover:shadow-lg transition-shadow'
              }`}>
                <CardContent className="p-6 text-center">
                  <div className="relative">
                    <div className={`text-4xl mb-4 ${badge.isEarned ? '' : 'grayscale opacity-50'}`}>
                      {badge.icon}
                    </div>
                    {badge.isEarned && (
                      <CheckCircle2 className="h-6 w-6 text-green-600 absolute -top-2 -right-2 bg-white rounded-full" />
                    )}
                    {!badge.isEarned && (
                      <Lock className="h-6 w-6 text-gray-400 absolute -top-2 -right-2 bg-white rounded-full p-1" />
                    )}
                  </div>
                  
                  <h3 className={`font-semibold text-lg mb-2 ${badge.isEarned ? '' : 'text-gray-600'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {getBadgeTypeIcon(badge.type)}
                    <Badge className={getRarityColor(badge.rarity)} variant="outline">
                      {badge.rarity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-medium">{badge.points}</span>
                    </div>
                    
                    {!badge.isEarned && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Requirements:</div>
                        {badge.criteria.quizCount && (
                          <div className="text-xs text-gray-600">Complete {badge.criteria.quizCount} quizzes</div>
                        )}
                        {badge.criteria.minScore && (
                          <div className="text-xs text-gray-600">Score {badge.criteria.minScore}% or higher</div>
                        )}
                        {badge.criteria.streakCount && (
                          <div className="text-xs text-gray-600">{badge.criteria.streakCount} quiz streak</div>
                        )}
                        {badge.criteria.perfectScore && (
                          <div className="text-xs text-gray-600">Perfect score (100%)</div>
                        )}
                      </div>
                    )}
                    
                    {badge.isEarned && (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Earned
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Badges */}
      {stats && stats.recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recently Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {stats.recentBadges.map((badge) => (
                <div key={badge.id} className="flex-shrink-0 text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className="font-medium text-sm">{badge.name}</h4>
                  <p className="text-xs text-gray-600">{formatDate(badge.earnedAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BadgeCollection;
