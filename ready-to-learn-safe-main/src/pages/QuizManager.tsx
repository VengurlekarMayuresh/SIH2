import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/Sidebar";
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Copy,
  Play,
  Pause,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  Target,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Download
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
  timeLimit: number;
  hint?: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  questions: Question[];
  settings: {
    timeLimit: number;
    passingScore: number;
    allowRetakes: boolean;
    maxAttempts: number;
    showExplanations: boolean;
    showCorrectAnswers: boolean;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
  };
  isActive: boolean;
  publishedAt: Date | null;
  analytics: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
  };
}

const QuizManager = () => {
  const { moduleId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  // Question form state
  const [questionForm, setQuestionForm] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    explanation: '',
    difficulty: 'medium',
    category: '',
    points: 10,
    timeLimit: 30,
    hint: ''
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (quizId && quizId !== 'new') {
      fetchQuiz();
    } else {
      // Initialize new quiz
      setQuiz({
        id: '',
        title: '',
        description: '',
        moduleId: moduleId || '',
        questions: [],
        settings: {
          timeLimit: 1800,
          passingScore: 70,
          allowRetakes: true,
          maxAttempts: 3,
          showExplanations: true,
          showCorrectAnswers: true,
          randomizeQuestions: false,
          randomizeOptions: false
        },
        isActive: false,
        publishedAt: null,
        analytics: {
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0
        }
      });
    }
  }, [quizId, moduleId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/institution/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    if (!quiz) return;

    try {
      setSaving(true);
      setError(null);

      const url = quizId === 'new' 
        ? '/api/institution/quizzes'
        : `/api/institution/quizzes/${quiz.id}`;
      
      const method = quizId === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quiz)
      });

      if (!response.ok) {
        throw new Error('Failed to save quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);

      if (quizId === 'new') {
        navigate(`/quiz-manager/${moduleId}/${data.quiz.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!quiz) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: questionForm.question || '',
      options: questionForm.options || ['', '', '', ''],
      correct: questionForm.correct || 0,
      explanation: questionForm.explanation || '',
      difficulty: questionForm.difficulty || 'medium',
      category: questionForm.category || '',
      points: questionForm.points || 10,
      timeLimit: questionForm.timeLimit || 30,
      hint: questionForm.hint
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });

    // Reset form
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      explanation: '',
      difficulty: 'medium',
      category: '',
      points: 10,
      timeLimit: 30,
      hint: ''
    });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    if (!quiz) return;

    const newQuestions = [...quiz.questions];
    newQuestions[index] = updatedQuestion;
    setQuiz({ ...quiz, questions: newQuestions });
    setEditingQuestion(null);
  };

  const deleteQuestion = (index: number) => {
    if (!quiz) return;

    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, i) => i !== index)
    });
  };

  const publishQuiz = async () => {
    if (!quiz) return;

    try {
      const response = await fetch(`/api/institution/quizzes/${quiz.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publish: !quiz.isActive })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish quiz');
      }

      await fetchQuiz(); // Refresh quiz data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish quiz');
    }
  };

  const validateQuiz = (): string[] => {
    const errors: string[] = [];
    
    if (!quiz) return ['Quiz data not loaded'];
    
    if (!quiz.title?.trim()) errors.push('Quiz title is required');
    if (quiz.questions.length === 0) errors.push('Quiz must have at least one question');
    
    quiz.questions.forEach((q, index) => {
      if (!q.question?.trim()) errors.push(`Question ${index + 1}: Question text is required`);
      if (q.options.filter(opt => opt.trim()).length < 2) errors.push(`Question ${index + 1}: At least 2 options required`);
      if (!q.explanation?.trim()) errors.push(`Question ${index + 1}: Explanation is required`);
      if (!q.category?.trim()) errors.push(`Question ${index + 1}: Category is required`);
    });
    
    return errors;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">Loading quiz...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Quiz not found or failed to load.</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/modules')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {quizId === 'new' ? 'Create New Quiz' : 'Edit Quiz'}
                </h1>
                <p className="text-muted-foreground">
                  {quiz.questions.length} questions • {quiz.analytics.totalAttempts} attempts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {quiz.id && (
                <>
                  <Button variant="outline" onClick={() => navigate(`/quiz/${quiz.id}/analytics`)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button 
                    variant={quiz.isActive ? "destructive" : "default"}
                    onClick={publishQuiz}
                  >
                    {quiz.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button onClick={saveQuiz} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Badge */}
          <div className="flex gap-2 mb-6">
            <Badge variant={quiz.isActive ? "default" : "secondary"}>
              {quiz.isActive ? 'Published' : 'Draft'}
            </Badge>
            <Badge variant="outline">
              {quiz.questions.length} Questions
            </Badge>
            <Badge variant="outline">
              {Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)} min estimated
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        value={quiz.title}
                        onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                        placeholder="Enter quiz title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Default Category</Label>
                      <Input
                        id="category"
                        value={questionForm.category}
                        onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                        placeholder="e.g., Fire Safety, Earthquake..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={quiz.description}
                      onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                      placeholder="Describe what this quiz covers..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      id="question"
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                      placeholder="Enter your question..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Answer Options</Label>
                    {questionForm.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="correct"
                            checked={questionForm.correct === index}
                            onChange={() => setQuestionForm({ ...questionForm, correct: index })}
                            className="mr-2"
                          />
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...(questionForm.options || [])];
                            newOptions[index] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}...`}
                        />
                        {index > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = questionForm.options?.filter((_, i) => i !== index) || [];
                              setQuestionForm({ 
                                ...questionForm, 
                                options: newOptions,
                                correct: questionForm.correct === index ? 0 : 
                                        questionForm.correct > index ? questionForm.correct - 1 : questionForm.correct
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {(questionForm.options?.length || 0) < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(questionForm.options || []), ''];
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={questionForm.difficulty}
                        onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                          setQuestionForm({ ...questionForm, difficulty: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        value={questionForm.points}
                        onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                        min="1"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={questionForm.timeLimit}
                        onChange={(e) => setQuestionForm({ ...questionForm, timeLimit: parseInt(e.target.value) })}
                        min="5"
                        max="300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                      placeholder="Explain why this is the correct answer..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="hint">Hint (Optional)</Label>
                    <Input
                      id="hint"
                      value={questionForm.hint}
                      onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                      placeholder="Optional hint for students..."
                    />
                  </div>

                  <Button onClick={addQuestion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {quiz.questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No questions added yet. Add your first question above.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quiz.questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.points} pts</Badge>
                              <Badge variant="outline">{question.timeLimit}s</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingQuestion(index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-2">{question.question}</h4>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={`p-2 rounded border text-sm ${
                                  optIndex === question.correct 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-gray-50'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {optIndex === question.correct && (
                                  <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {question.explanation && (
                            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={Math.floor(quiz.settings.timeLimit / 60)}
                        onChange={(e) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, timeLimit: parseInt(e.target.value) * 60 }
                        })}
                        min="1"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        value={quiz.settings.passingScore}
                        onChange={(e) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, passingScore: parseInt(e.target.value) }
                        })}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={quiz.settings.maxAttempts}
                        onChange={(e) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, maxAttempts: parseInt(e.target.value) }
                        })}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Display Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Retakes</Label>
                        <p className="text-sm text-muted-foreground">Allow students to retake the quiz</p>
                      </div>
                      <Switch
                        checked={quiz.settings.allowRetakes}
                        onCheckedChange={(checked) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, allowRetakes: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Explanations</Label>
                        <p className="text-sm text-muted-foreground">Show explanations after answering</p>
                      </div>
                      <Switch
                        checked={quiz.settings.showExplanations}
                        onCheckedChange={(checked) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, showExplanations: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-sm text-muted-foreground">Show correct answers in results</p>
                      </div>
                      <Switch
                        checked={quiz.settings.showCorrectAnswers}
                        onCheckedChange={(checked) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, showCorrectAnswers: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Randomize Questions</Label>
                        <p className="text-sm text-muted-foreground">Show questions in random order</p>
                      </div>
                      <Switch
                        checked={quiz.settings.randomizeQuestions}
                        onCheckedChange={(checked) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, randomizeQuestions: checked }
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Randomize Options</Label>
                        <p className="text-sm text-muted-foreground">Show answer options in random order</p>
                      </div>
                      <Switch
                        checked={quiz.settings.randomizeOptions}
                        onCheckedChange={(checked) => setQuiz({
                          ...quiz,
                          settings: { ...quiz.settings, randomizeOptions: checked }
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Preview</CardTitle>
                  <p className="text-muted-foreground">This is how students will see your quiz</p>
                </CardHeader>
                <CardContent>
                  {quiz.questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Add questions to see the preview
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {quiz.questions.map((question, index) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-medium">
                              Q{index + 1}: {question.question}
                            </h4>
                            <div className="flex gap-2">
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.points} pts</Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 mb-4">
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold">
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {question.hint && (
                            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded mb-2">
                              <HelpCircle className="h-4 w-4 inline mr-1" />
                              Hint: {question.hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{quiz.analytics.totalAttempts}</div>
                      <div className="text-sm text-muted-foreground">Total Attempts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">{quiz.analytics.averageScore}%</div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary">{quiz.analytics.passRate}%</div>
                      <div className="text-sm text-muted-foreground">Pass Rate</div>
                    </div>
                  </div>
                  
                  {quiz.analytics.totalAttempts === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No attempts yet. Publish the quiz to start collecting data.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Please fix the following issues:</div>
                <ul className="mt-2 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizManager;
