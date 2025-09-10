import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/Sidebar";
import { 
  MessageCircle, 
  Users, 
  Trophy, 
  Star, 
  Search,
  Send,
  ThumbsUp,
  Clock,
  BookOpen,
  HelpCircle
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    level: number;
    badge: string;
  };
  timestamp: Date;
  likes: number;
  replies: number;
  tags: string[];
  moduleId?: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  currentTopic: string;
  nextSession: Date;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const mockForumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best practices for fire evacuation in high-rise buildings?',
    content: 'I work in a 20-story building and want to make sure I know the safest evacuation routes. Any tips from experts?',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      level: 12,
      badge: 'Fire Safety Expert'
    },
    timestamp: new Date('2024-01-15T10:30:00'),
    likes: 24,
    replies: 8,
    tags: ['fire-safety', 'evacuation', 'workplace']
  },
  {
    id: '2',
    title: 'Earthquake kit essentials for families?',
    content: 'Just completed the earthquake module. What should I include in my family emergency kit? Looking for practical suggestions.',
    author: {
      name: 'Mike Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      level: 8,
      badge: 'Safety Learner'
    },
    timestamp: new Date('2024-01-14T16:45:00'),
    likes: 18,
    replies: 12,
    tags: ['earthquake', 'family', 'emergency-kit']
  },
  {
    id: '3',
    title: 'Flood response: When to evacuate vs shelter in place?',
    content: 'The flood safety module covered this, but I\'d love to hear real experiences from people who\'ve been through floods.',
    author: {
      name: 'Lisa Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      level: 15,
      badge: 'Disaster Expert'
    },
    timestamp: new Date('2024-01-14T09:20:00'),
    likes: 31,
    replies: 15,
    tags: ['flood', 'evacuation', 'experience']
  }
];

const mockStudyGroups: StudyGroup[] = [
  {
    id: '1',
    name: 'Fire Safety Professionals',
    description: 'For workplace safety officers and fire prevention specialists',
    members: 24,
    maxMembers: 30,
    currentTopic: 'Industrial Fire Prevention',
    nextSession: new Date('2024-01-20T14:00:00'),
    difficulty: 'Advanced'
  },
  {
    id: '2',
    name: 'Family Emergency Prep',
    description: 'Parents sharing tips for keeping families safe during disasters',
    members: 18,
    maxMembers: 25,
    currentTopic: 'Kids Emergency Preparedness',
    nextSession: new Date('2024-01-18T19:00:00'),
    difficulty: 'Beginner'
  },
  {
    id: '3',
    name: 'Earthquake Response Team',
    description: 'Deep dive into earthquake preparedness and response strategies',
    members: 12,
    maxMembers: 20,
    currentTopic: 'Building Assessment After Quakes',
    nextSession: new Date('2024-01-19T10:30:00'),
    difficulty: 'Intermediate'
  }
];

const Community = () => {
  const [activeTab, setActiveTab] = useState('forum');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const filteredPosts = mockForumPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleNewPost = () => {
    // Here you would submit to backend
    console.log('New post:', { title: newPostTitle, content: newPostContent });
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostForm(false);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Disaster Expert': return 'bg-accent text-accent-foreground';
      case 'Fire Safety Expert': return 'bg-secondary text-secondary-foreground';
      case 'Safety Learner': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Advanced': return 'bg-secondary text-secondary-foreground';
      case 'Intermediate': return 'bg-accent text-accent-foreground';
      case 'Beginner': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Community</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Connect, learn, and share safety knowledge with fellow learners
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">142</div>
                <p className="text-sm text-muted-foreground">Forum Posts</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-accent mx-auto mb-3" />
                <div className="text-2xl font-bold text-accent mb-1">8</div>
                <p className="text-sm text-muted-foreground">Study Groups</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="text-2xl font-bold text-secondary mb-1">28</div>
                <p className="text-sm text-muted-foreground">Top Contributors</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-primary mb-1">356</div>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Discussion Forum
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Study Groups
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Get Help
              </TabsTrigger>
            </TabsList>

            {/* Forum Tab */}
            <TabsContent value="forum" className="space-y-6">
              {/* Search and New Post */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discussions, topics, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={() => setShowNewPostForm(true)}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  New Discussion
                </Button>
              </div>

              {/* New Post Form */}
              {showNewPostForm && (
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle>Start a New Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Discussion title..."
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Share your question or start a discussion..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="w-full p-3 border rounded-md resize-none h-24"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleNewPost} size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Post Discussion
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNewPostForm(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Forum Posts */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground text-lg mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-medium">{post.author.name}</span>
                                <Badge className={`text-xs ${getBadgeColor(post.author.badge)}`}>
                                  Level {post.author.level}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(post.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {post.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {post.replies} replies
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Study Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {mockStudyGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
                          <Badge className={`text-xs ${getDifficultyColor(group.difficulty)}`}>
                            {group.difficulty}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <div>{group.members}/{group.maxMembers} members</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{group.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium">Current Topic:</span>
                          <span className="text-muted-foreground">{group.currentTopic}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-accent" />
                          <span className="font-medium">Next Session:</span>
                          <span className="text-muted-foreground">
                            {group.nextSession.toLocaleDateString()} at {group.nextSession.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">
                        Join Study Group
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Get Help Tab */}
            <TabsContent value="help" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Quick Help */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      Quick Help
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg hover:bg-hover cursor-pointer">
                        <h4 className="font-medium">How do I track my progress?</h4>
                        <p className="text-sm text-muted-foreground">Visit the Progress page to see your completion stats</p>
                      </div>
                      <div className="p-3 border rounded-lg hover:bg-hover cursor-pointer">
                        <h4 className="font-medium">Can I retake quizzes?</h4>
                        <p className="text-sm text-muted-foreground">Yes, quizzes can be retaken to improve your score</p>
                      </div>
                      <div className="p-3 border rounded-lg hover:bg-hover cursor-pointer">
                        <h4 className="font-medium">How do I join a study group?</h4>
                        <p className="text-sm text-muted-foreground">Browse groups and click 'Join' to participate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expert Mentors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-accent" />
                      Expert Mentors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Get personalized help from certified safety experts
                    </p>
                    <Button className="w-full bg-gradient-to-r from-accent to-secondary text-white">
                      Request Mentor Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Community;
