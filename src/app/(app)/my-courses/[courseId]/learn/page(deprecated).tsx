
'use client';

import { useState, useMemo, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { dataApi } from '@/lib/data';
import { coursesApi } from '@/lib/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronsUpDown, FileText, HelpCircle, LayoutPanelLeft, Menu, PlayCircle, History, ShieldQuestion, Star, PanelRightOpen } from 'lucide-react';
import type { Lecture, Course } from '@/lib/types';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Fetch course data from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('📚 Fetching course data for:', courseId);
        const courseData = await coursesApi.getById(courseId);
        console.log('📚 Course data received:', courseData);
        setCourse(courseData.course || courseData);
        
        // Set initial active section and lecture
        const actualCourse = courseData.course || courseData;
        if (actualCourse.sections?.length > 0) {
          setActiveSectionId(actualCourse.sections[0]._id);
          if (actualCourse.sections[0].lectures?.length > 0) {
            setActiveLectureId(actualCourse.sections[0].lectures[0]._id);
          }
        }
      } catch (err) {
        console.error('📚 Error fetching course:', err);
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const activeSection = course.sections.find(s => (s.id || s._id) === activeSectionId);
  const activeLecture = activeSection?.lectures.find(l => (l.id || l._id) === activeLectureId);

  const handleLectureSelect = (sectionId: string, lectureId: string) => {
    setActiveSectionId(sectionId);
    setActiveLectureId(lectureId);
  };

  const MainContent = ({ lecture }: { lecture: Lecture | undefined }) => {
    if (!lecture) {
      return (
        <div className="flex-grow flex items-center justify-center bg-muted">
          <p>Select a lecture to begin.</p>
        </div>
      );
    }

    switch (lecture.type) {
      case 'video':
        return (
            <div>
                <div className="bg-black aspect-video w-full flex items-center justify-center">
                    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center">
                        <PlayCircle className="w-24 h-24 text-gray-600" />
                        <p className="mt-4 text-xl">Video player placeholder</p>
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-4">About this video</h2>
                    <p className="text-muted-foreground">{lecture.content}</p>
                </div>
            </div>
        );
      case 'quiz':
        return <QuizContainer lecture={lecture} />;
      case 'note':
        return (
            <div className="p-8">
                <Card>
                    <CardContent className="p-6">
                        <div
                            className="prose dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: (lecture.content || lecture.note?.content || '').replace(/\n/g, '<br />') }}
                        />
                    </CardContent>
                </Card>
            </div>
        );
      default:
        return <div className="p-8">Unsupported lecture type.</div>;
    }
  };

  const QuizContainer = ({ lecture }: { lecture: Lecture }) => {
    const { currentUser } = useAuth();
    const [view, setView] = useState<'details' | 'taking' | 'results'>('details');
    const [lastAttemptScore, setLastAttemptScore] = useState<number | null>(null);

    const quizData = useMemo(() => {
        // First try to get quiz data from lecture.quiz (correct MongoDB structure)
        if (lecture.quiz && lecture.quiz.questions) {
            console.log('📝 Quiz data found in lecture.quiz:', lecture.quiz);
            return lecture.quiz;
        }
        
        // Fallback: try to parse from lecture.content (for backward compatibility)
        if (lecture.content) {
            try {
                const parsed = JSON.parse(lecture.content);
                console.log('📝 Quiz data parsed from lecture.content:', parsed);
                return parsed;
            } catch (e) {
                console.warn('📝 Failed to parse quiz content:', e);
            }
        }
        
        console.error('📝 No quiz data found in lecture:', { hasQuiz: !!lecture.quiz, hasContent: !!lecture.content });
        return null;
    }, [lecture.quiz, lecture.content]);

    const handleQuizFinish = (score: number) => {
        const lectureId = lecture.id || lecture._id;
        if (!currentUser || !lectureId) return;
        dataApi.addQuizAttempt(currentUser.id, lectureId, score);
        setLastAttemptScore(score);
        setView('results');
    };
    
    if (!quizData) {
        return <div className="p-8 text-destructive">Error parsing quiz content.</div>;
    }

    if(view === 'taking') {
        return <QuizTakingView quizData={quizData} lecture={lecture} onFinish={handleQuizFinish} onPause={() => setView('details')} />
    }
    
    if(view === 'results') {
        return <QuizResultsView score={lastAttemptScore!} onTryAgain={() => setView('details')} />
    }

    return <QuizDetailsView quizData={quizData} lecture={lecture} onTakeQuiz={() => setView('taking')} />;
  }

  const QuizDetailsView = ({ quizData, lecture, onTakeQuiz }: { quizData: any, lecture: Lecture, onTakeQuiz: () => void }) => {
    const { currentUser } = useAuth();
    const lectureId = lecture.id || lecture._id;
    if (!currentUser || !lectureId) return null;

    const attempts = dataApi.getQuizAttempts(currentUser.id, lectureId);
    const attemptsLast24Hours = attempts.filter(a => (new Date().getTime() - parseISO(a.timestamp).getTime()) < 24 * 60 * 60 * 1000);
    const attemptsRemaining = Math.max(0, 3 - attemptsLast24Hours.length);

    const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : null;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <ShieldQuestion className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-bold font-headline mt-2">{lecture.title}</CardTitle>
                    <CardDescription>Ready to test your knowledge?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <StatCard title="Questions" value={quizData.questions.length} icon={<HelpCircle />} />
                        <StatCard title="Your Best Score" value={bestScore !== null ? `${bestScore}/100` : 'N/A'} icon={<Star />} />
                    </div>
                     <div className="text-center">
                        <p className="text-lg font-semibold">{attemptsRemaining} attempts remaining today</p>
                        <p className="text-sm text-muted-foreground">(Max 3 attempts per 24 hours)</p>
                     </div>
                    <Button size="lg" className="w-full" onClick={onTakeQuiz} disabled={attemptsRemaining <= 0}>
                        {attempts.length > 0 ? 'Try Again' : 'Take Quiz'}
                    </Button>
                    
                    {attempts.length > 0 && (
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold flex items-center gap-2"><History className="w-5 h-5"/> Attempt History</h3>
                            <ul className="space-y-2">
                                {attempts.slice().reverse().map(attempt => (
                                    <li key={attempt.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(parseISO(attempt.timestamp), { addSuffix: true })}
                                        </span>
                                        <span className={`font-bold ${attempt.score > 80 ? 'text-green-600' : attempt.score > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {attempt.score}/100
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
  };
  
  const QuizResultsView = ({ score, onTryAgain }: { score: number, onTryAgain: () => void }) => {
    return (
        <div className="p-8 max-w-3xl mx-auto text-center">
            <Card className="mb-8 bg-muted">
                <CardContent className="p-8">
                    <p className="text-muted-foreground mb-2">Your Score</p>
                    <h3 className="text-6xl font-bold text-primary">{score}/100</h3>
                    <p className="text-xl mt-4">{score >= 80 ? "Excellent work! 🏆" : score >= 50 ? "Good effort!" : "Keep practicing!"}</p>
                </CardContent>
            </Card>
            <Button size="lg" onClick={onTryAgain}>
                Back to Quiz Details
            </Button>
        </div>
    )
  }

  const QuizTakingView = ({ quizData, lecture, onFinish, onPause }: { quizData: any, lecture: Lecture, onFinish: (score: number) => void, onPause: () => void }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    const { questions } = quizData;
    const pointsPerQuestion = 100 / questions.length;

    const handleSingleChoiceChange = (questionId: string, optionText: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionText }));
    };

    const handleMultipleChoiceChange = (questionId: string, optionText: string, isChecked: boolean) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => {
            const currentAnswers = (prev[questionId] as string[] || []);
            if (isChecked) {
                return { ...prev, [questionId]: [...currentAnswers, optionText] };
            } else {
                return { ...prev, [questionId]: currentAnswers.filter(a => a !== optionText) };
            }
        });
    };

    const handleSubmit = () => {
        let newScore = 0;
        questions.forEach((q: any) => {
            const userAnswers = selectedAnswers[q.id];
            if (!userAnswers) return;

            if (q.type === 'single-choice') {
                const correctOption = q.options.find((opt: any) => opt.isCorrect);
                if (correctOption && userAnswers === correctOption.text) {
                    newScore += pointsPerQuestion;
                }
            } else if (q.type === 'multiple-choice') {
                const correctOptions = q.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.text);
                const userSelected = userAnswers as string[];
                const incorrectSelections = userSelected.filter(ans => !correctOptions.includes(ans));
                
                if (correctOptions.length === userSelected.length && incorrectSelections.length === 0) {
                    newScore += pointsPerQuestion;
                }
            }
        });
        
        setIsSubmitted(true);
        onFinish(Math.round(newScore));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold font-headline">{lecture.title}</h2>
                <Button variant="outline" onClick={onPause}>Pause Quiz</Button>
            </div>
            
            <div className="space-y-8">
                {questions.map((question: any, qIndex: number) => (
                    <Card key={question.id}>
                        <CardHeader>
                            <CardTitle>Question {qIndex + 1}</CardTitle>
                            <p className="text-muted-foreground pt-2">{question.text}</p>
                        </CardHeader>
                        <CardContent>
                            {question.type === 'single-choice' && (
                                <RadioGroup value={selectedAnswers[question.id] as string} onValueChange={(val) => handleSingleChoiceChange(question.id, val)} disabled={isSubmitted}>
                                    {question.options.map((option: any, oIndex: number) => (
                                        <div key={oIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                            <RadioGroupItem value={option.text} id={`q${qIndex}-o${oIndex}`} />
                                            <Label htmlFor={`q${qIndex}-o${oIndex}`} className={cn("cursor-pointer")}>
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                             {question.type === 'multiple-choice' && (
                                <div className="space-y-3">
                                    {question.options.map((option: any, oIndex: number) => (
                                        <div key={oIndex} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                                            <Checkbox 
                                                id={`q${qIndex}-o${oIndex}`} 
                                                checked={(selectedAnswers[question.id] as string[] || []).includes(option.text)}
                                                onCheckedChange={(checked) => handleMultipleChoiceChange(question.id, option.text, !!checked)}
                                                disabled={isSubmitted}
                                            />
                                            <Label htmlFor={`q${qIndex}-o${oIndex}`} className={cn("cursor-pointer")}>
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                <Button size="lg" className="w-full" onClick={handleSubmit}>Submit Quiz</Button>
            </div>
        </div>
    )
  }

  const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {icon}
            {title}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
);


  const CourseCurriculum = () => (
    <>
      <h2 className="font-semibold mb-4 px-4">{course.title}</h2>
      <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
        {course.sections.map((section, index) => (
          <AccordionItem value={`item-${index}`} key={section.id}>
            <AccordionTrigger className="px-4">{section.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-sm">
                {section.lectures.map((lecture) => (
                  <li key={lecture.id}>
                    <button 
                      onClick={() => {
                        const lectureId = lecture.id || lecture._id;
                        const sectionId = section.id || section._id;
                        if (lectureId && sectionId) {
                          handleLectureSelect(sectionId, lectureId);
                        }
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 flex items-center gap-3 rounded-none hover:bg-muted",
                        activeLectureId === lecture.id && "bg-primary/10 text-primary font-semibold"
                      )}
                    >
                      {lecture.type === 'video' && <PlayCircle className="w-4 h-4 shrink-0"/>}
                      {lecture.type === 'quiz' && <HelpCircle className="w-4 h-4 shrink-0"/>}
                      {lecture.type === 'note' && <FileText className="w-4 h-4 shrink-0"/>}
                      <span className="flex-grow">{lecture.title}</span>
                       <Check className={cn("w-4 h-4 text-green-500", false ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar - Course Sections */}
      <aside className={cn(
          "bg-background border-r flex-col transition-all duration-300 ease-in-out hidden md:flex",
          isLeftSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="h-16 flex items-center px-4 border-b shrink-0 justify-between">
            <Button variant="ghost" asChild>
                <Link href={`/courses/${course.id}`} className="font-bold text-lg whitespace-nowrap">
                    <ChevronLeft className="mr-2 h-5 w-5"/>
                    Exit Course
                </Link>
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <CourseCurriculum />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 border-b shrink-0">
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    className="hidden md:inline-flex"
                >
                    <Menu className="w-4 h-4"/>
                </Button>
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon"><ChevronsUpDown className="w-4 h-4"/></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                            <aside className="flex flex-col h-full">
                                <div className="h-16 flex items-center px-4 border-b shrink-0">
                                    <Button variant="ghost" asChild>
                                        <Link href={`/courses/${course.id}`} className="font-bold text-lg">
                                            <ChevronLeft className="mr-2 h-5 w-5"/>
                                            Exit Course
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto py-4">
                                    <CourseCurriculum />
                                </div>
                            </aside>
                        </SheetContent>
                    </Sheet>
                </div>
                 <h1 className="text-xl font-semibold truncate">{activeLecture?.title || course.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
                <Button>Mark as Complete <Check className="ml-2 w-4 h-4"/></Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                    className="hidden lg:inline-flex"
                >
                    <PanelRightOpen className="w-4 h-4"/>
                </Button>
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon"><LayoutPanelLeft className="w-4 h-4"/></Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="p-0 w-80">
                             <RightSidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-auto">
            <MainContent lecture={activeLecture} />
        </div>
      </main>

      {/* Right Sidebar - Lectures in Section */}
      <aside className={cn(
        "bg-background border-l flex-col transition-all duration-300 ease-in-out hidden lg:flex",
        isRightSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <RightSidebarContent />
      </aside>
    </div>
  );

  function RightSidebarContent() {
    if (!activeSection) return null;
      return (
        <Card className="h-full border-0 rounded-none">
            <CardHeader className="shrink-0">
                <CardTitle>{activeSection?.title || 'Lectures'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ul className="space-y-1">
                    {activeSection?.lectures.map(lecture => (
                        <li key={lecture.id}>
                            <button 
                                onClick={() => {
                                  const lectureId = lecture.id || lecture._id;
                                  const sectionId = activeSection.id || activeSection._id;
                                  if (lectureId && sectionId) {
                                    handleLectureSelect(sectionId, lectureId);
                                  }
                                }}
                                className={cn(
                                    "w-full text-left p-3 flex items-center gap-3 transition-colors",
                                    activeLectureId === lecture.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                                )}
                            >
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                    {lecture.type === 'video' && <PlayCircle className="w-5 h-5"/>}
                                    {lecture.type === 'quiz' && <HelpCircle className="w-5 h-5"/>}
                                    {lecture.type === 'note' && <FileText className="w-5 h-5"/>}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm">{lecture.title}</p>
                                    {lecture.duration && <p className="text-xs text-muted-foreground">{lecture.duration} min</p>}
                                </div>
                                <Check className={cn("w-5 h-5 text-green-500", false ? 'opacity-100' : 'opacity-0')} />
                            </button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )
  }
}

    

    