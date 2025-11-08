

"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider, useFieldArray, useFormContext, Controller, useWatch } from "react-hook-form";
import * as z from "zod";
import {
  FileText,
  Video,
  ClipboardList,
  LayoutPanelLeft,
  Settings,
  ChevronLeft,
  UploadCloud,
  GripVertical,
  PlusCircle,
  Trash2,
  HelpCircle,
  Check,
  Image as ImageIcon,
  Save,
  Clock,
  File as FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course, Section, Lecture } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Switch } from "../ui/switch";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import CourseLandingPreview from "./CourseLandingPreview";
import { cn } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { categoriesApi } from "@/lib/api";
import { useUpload } from "@/contexts/UploadContext";
import QuillEditor from "@/components/ui/QuillEditor";

// Duration Input Component for minutes and seconds
function DurationInput({ value, onChange, className }: { value: number; onChange: (seconds: number) => void; className?: string }) {
  const minutes = Math.floor((value || 0) / 60);
  const seconds = (value || 0) % 60;

  const updateDuration = (newMinutes: number, newSeconds: number) => {
    const totalSeconds = (newMinutes * 60) + newSeconds;
    onChange(totalSeconds);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          value={minutes}
          onChange={(e) => updateDuration(parseInt(e.target.value) || 0, seconds)}
          className="w-16 text-center"
          placeholder="0"
        />
        <span className="text-sm text-muted-foreground">min</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          max="59"
          value={seconds}
          onChange={(e) => updateDuration(minutes, parseInt(e.target.value) || 0)}
          className="w-16 text-center"
          placeholder="0"
        />
        <span className="text-sm text-muted-foreground">sec</span>
      </div>
    </div>
  );
}


const quizQuestionSchema = z.object({
  id: z.string().optional(),
  text: z.string().optional().default(''), // Made optional for draft saves
  type: z.enum(['single-choice', 'multiple-choice']).optional().default('single-choice'),
  options: z.array(z.object({
    text: z.string().optional().default(''), // Made optional for draft saves
    isCorrect: z.boolean().optional().default(false)
  })).optional().default([]), // Made optional for draft saves
});

const videoDataSchema = z.object({
  apiVideoId: z.string().nullable().optional(),
  embedUrl: z.string().nullable().optional(),
  playerUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  hlsUrl: z.string().nullable().optional(),
  mp4Url: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  isProcessing: z.boolean().nullable().optional(),
}).optional();

const lectureSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(['video', 'quiz', 'note']),
  duration: z.coerce.number().min(0, "Duration cannot be negative"),
  description: z.string().optional(),
  order: z.number().optional(),
  isPreview: z.boolean().optional(),
  
  // Video-specific fields
  video: videoDataSchema,
  
  // Quiz-specific fields (legacy structure for compatibility)
  questions: z.array(quizQuestionSchema).optional().default([]),
  graded: z.boolean().default(false),
  passingScore: z.number().optional(),
  
  // Legacy fields for backward compatibility
  content: z.string().optional(),
  thumbnailId: z.string().optional(),
});

const sectionSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    lectures: z.array(lectureSchema),
    order: z.number().optional(),
});

const courseBuilderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  thumbnailId: z.string().optional(),
  bannerId: z.string().optional(),
  previewVideoUrl: z.string().optional(),
  sections: z.array(sectionSchema),
  isPublished: z.boolean(),
});

type CourseBuilderValues = z.infer<typeof courseBuilderSchema>;

const STEPS = [
  { id: "info", label: "Basic Info", icon: Settings, fields: ['title', 'description', 'price', 'category'] },
  { id: "curriculum", label: "Curriculum", icon: ClipboardList, fields: ['sections'] },
  { id: "landing", label: "Landing Page", icon: LayoutPanelLeft, fields: [] },
];

interface CourseBuilderFormProps {
  course?: Course;
  onSave: (data: FormData) => Promise<any>;
}

export function CourseBuilderForm({ course, onSave }: CourseBuilderFormProps) {
  const [activeStep, setActiveStep] = React.useState(STEPS[0].id);
  const [activeLecture, setActiveLecture] = React.useState<{sectionIndex: number, lectureIndex: number} | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [categories, setCategories] = React.useState<Array<{_id: string, name: string}>>([]);
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [bannerFile, setBannerFile] = React.useState<File | null>(null);
  const [demoVideoFile, setDemoVideoFile] = React.useState<File | null>(null);
  
  // Use global upload context
  const {
    showUploadProgress,
    updateUploadProgress,
    setUploadFileName,
    setUploadComplete,
    setUploadError,
    hideUploadProgress
  } = useUpload();
  
  const [savedCourseId, setSavedCourseId] = React.useState<string | null>(null);
  const isUploadingVideosRef = React.useRef(false);
  const router = useRouter();
  const { toast } = useToast();

  // Load categories on component mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesApi.getAll();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadCategories();
  }, [toast]);

  const form = useForm<CourseBuilderValues>({
    resolver: zodResolver(courseBuilderSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      price: course?.price || 0,
      category: course ? (typeof course.category === 'object' ? course.category._id : course.category) || "" : "",
      thumbnailId: course?.thumbnail?.url ? "custom" : "course-1",
      bannerId: course?.banner?.url ? "custom" : "hero-1", 
      previewVideoUrl: course?.demoVideo?.url || course?.previewVideoUrl || "",
      requirements: course?.requirements || [],
      whatYouWillLearn: course?.whatYouWillLearn || [],
      sections: course?.sections || [],
      isPublished: course?.isPublished || course?.status === 'published' || false,
    },
    mode: "onChange",
  });

  const { trigger } = form;

  // Reset form when course data changes (for editing existing courses)
  // BUT don't reset while videos are uploading to avoid clearing upload progress
  React.useEffect(() => {
    if (course && !isUploadingVideosRef.current) {
      console.log('🔄 Form reset triggered by course prop change', { courseId: course._id, isUploadingVideos: isUploadingVideosRef.current });
      
      // Transform sections to preserve note content and quiz data properly
      const transformedSections = course.sections?.map(section => ({
        ...section,
        lectures: section.lectures?.map(lecture => {
          if (lecture.type === 'note') {
            // Preserve the content field for form usage
            return {
              ...lecture,
              content: lecture.content || lecture.note?.content || ''
            };
          } else if (lecture.type === 'quiz') {
            // Transform and fix quiz data for form usage
            const rawQuestions = (lecture as any).questions || (lecture as any).quiz?.questions || [];
            console.log('📥 Loading quiz lecture:', lecture.title);
            console.log('📥 Raw questions sources:', {
              lectureQuestions: !!(lecture as any).questions,
              quizQuestions: !!(lecture as any).quiz?.questions,
              questionsCount: rawQuestions.length,
              rawQuestions: rawQuestions
            });
            
            const transformedQuestions = rawQuestions.map((question: any, index: number) => {
              // Fix question structure to match schema
              const questionText = question.text || question.question || `Question ${index + 1}`;
              const questionType = question.type === 'single' ? 'single-choice' : 
                                  question.type === 'multiple' ? 'multiple-choice' : 
                                  question.type || 'single-choice';
              
              // Get correct answers array from MongoDB format
              const correctAnswers = Array.isArray(question.correctAnswers) ? question.correctAnswers : 
                                    typeof question.correctAnswers === 'number' ? [question.correctAnswers] : [];

              let questionOptions = [];
              if (Array.isArray(question.options) && question.options.length > 0) {
                questionOptions = question.options.map((option: any, optIndex: number) => {
                  // If option is a string, convert to object
                  if (typeof option === 'string') {
                    return {
                      text: option || `Option ${optIndex + 1}`,
                      isCorrect: correctAnswers.includes(optIndex) // Use correctAnswers array to determine if correct
                    };
                  }
                  // If already an object, ensure it has required fields
                  return {
                    text: option.text || option.value || `Option ${optIndex + 1}`,
                    // Check both correctAnswers array and existing isCorrect property
                    isCorrect: correctAnswers.includes(optIndex) || !!option.isCorrect || !!option.correct
                  };
                });
              } else {
                // Create default options if none exist
                questionOptions = [
                  { text: 'Option 1', isCorrect: correctAnswers.length === 0 || correctAnswers.includes(0) },
                  { text: 'Option 2', isCorrect: correctAnswers.includes(1) }
                ];
              }

              // Ensure at least 2 options exist
              if (questionOptions.length < 2) {
                while (questionOptions.length < 2) {
                  questionOptions.push({
                    text: `Option ${questionOptions.length + 1}`,
                    isCorrect: false
                  });
                }
              }

              return {
                id: question.id || `q_${index}`,
                text: questionText,
                type: questionType,
                options: questionOptions
              };
            }); // Keep all questions, even empty ones for draft saves

            console.log('✅ Transformed questions for form:', transformedQuestions.length, transformedQuestions);
            
            return {
              ...(lecture as any),
              questions: transformedQuestions,
              graded: (lecture as any).graded !== undefined ? (lecture as any).graded : (lecture as any).quiz?.isGraded || false,
              passingScore: (lecture as any).passingScore !== undefined ? (lecture as any).passingScore : (lecture as any).quiz?.passingScore || 70
            };
          }
          return lecture;
        }) || []
      })) || [];
      
      // Debug: Check if note lectures have content and quiz lectures have questions after transformation
      transformedSections.forEach((section, sIdx) => {
        section.lectures?.forEach((lecture, lIdx) => {
          if (lecture.type === 'note') {
            console.log(`🔍 Note lecture ${sIdx}.${lIdx} "${lecture.title}":`, {
              hasContent: !!lecture.content,
              contentLength: lecture.content?.length || 0,
              contentPreview: lecture.content?.substring(0, 50) || 'EMPTY'
            });
          } else if (lecture.type === 'quiz') {
            console.log(`🔍 Quiz lecture ${sIdx}.${lIdx} "${lecture.title}":`, {
              hasQuestions: !!(lecture as any).questions?.length,
              questionCount: (lecture as any).questions?.length || 0,
              isGraded: (lecture as any).graded,
              passingScore: (lecture as any).passingScore,
              questionsPreview: (lecture as any).questions?.map((q: any) => ({
                text: q.text?.substring(0, 30) || 'NO_TEXT',
                type: q.type,
                optionsCount: q.options?.length || 0
              })) || []
            });
          }
        });
      });
      
      form.reset({
        title: course.title || "",
        description: course.description || "",
        price: course.price || 0,
        category: typeof course.category === 'object' ? course.category._id : course.category || "",
        thumbnailId: course.thumbnail?.url ? "custom" : "course-1",
        bannerId: course.banner?.url ? "custom" : "hero-1", 
        previewVideoUrl: course.demoVideo?.url || course.previewVideoUrl || "",
        requirements: course.requirements || [],
        whatYouWillLearn: course.whatYouWillLearn || [],
        sections: transformedSections,
        isPublished: course.isPublished || course.status === 'published' || false,
      });
    }
  }, [course, form]);

  const handleStepClick = async (stepId: string) => {
      setActiveStep(stepId);
  };

  // Quiz validation function
  const validateQuizzes = (data: CourseBuilderValues): string[] => {
    const errors: string[] = [];
    
    data.sections?.forEach((section, sectionIndex) => {
      section.lectures?.forEach((lecture, lectureIndex) => {
        if (lecture.type === 'quiz') {
          const questions = lecture.questions || [];
          
          if (questions.length === 0) {
            errors.push(`Section "${section.title}" - Quiz "${lecture.title}": Add at least one question`);
            return;
          }
          
          questions.forEach((question, questionIndex) => {
            // Check if question text is empty
            if (!question.text?.trim()) {
              errors.push(`Section "${section.title}" - Quiz "${lecture.title}" - Question ${questionIndex + 1}: Enter question text`);
            }
            
            // Check if options exist and have text
            const options = question.options || [];
            if (options.length < 2) {
              errors.push(`Section "${section.title}" - Quiz "${lecture.title}" - Question ${questionIndex + 1}: Add at least 2 options`);
            }
            
            let hasEmptyOption = false;
            options.forEach((option, optionIndex) => {
              if (!option.text?.trim()) {
                hasEmptyOption = true;
              }
            });
            
            if (hasEmptyOption) {
              errors.push(`Section "${section.title}" - Quiz "${lecture.title}" - Question ${questionIndex + 1}: Fill in all option texts`);
            }
            
            // Check if correct answer is selected
            const hasCorrectAnswer = options.some(option => option.isCorrect);
            if (!hasCorrectAnswer) {
              errors.push(`Section "${section.title}" - Quiz "${lecture.title}" - Question ${questionIndex + 1}: Select at least one correct answer`);
            }
          });
        }
      });
    });
    
    return errors;
  };

  const onSubmit = async (data: CourseBuilderValues) => {
    // Validate quizzes before saving
    const quizErrors = validateQuizzes(data);
    if (quizErrors.length > 0) {
      // Show quiz validation errors
      toast({
        title: "Quiz validation errors",
        description: (
          <div className="space-y-1">
            {quizErrors.slice(0, 3).map((error, index) => (
              <div key={index} className="text-sm text-red-600">{error}</div>
            ))}
            {quizErrors.length > 3 && (
              <div className="text-sm text-muted-foreground">...and {quizErrors.length - 3} more errors</div>
            )}
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create FormData for API submission
      const formData = new FormData();
      
      // Transform quiz data to MongoDB format
      const transformedSections = data.sections?.map((section: any) => ({
        ...section,
        lectures: section.lectures?.map((lecture: any) => {
          if (lecture.type === 'quiz' && lecture.questions) {
            console.log('🔄 Transforming quiz lecture:', lecture.title);
            console.log('📝 Original questions count:', lecture.questions.length);
            console.log('📝 First question preview:', lecture.questions[0]);
            
            const transformedQuiz = {
              ...lecture,
              quiz: {
                isGraded: lecture.graded || false,
                passingScore: lecture.passingScore || 70,
                questions: lecture.questions.map((question: any) => {
                  // Transform frontend format to MongoDB format
                  const correctAnswers: number[] = [];
                  question.options?.forEach((option: any, index: number) => {
                    if (option.isCorrect) {
                      correctAnswers.push(index);
                    }
                  });
                  
                  const transformedQuestion = {
                    question: question.text,
                    type: question.type === 'single-choice' ? 'single' : 'multiple',
                    options: question.options?.map((opt: any) => opt.text) || [],
                    correctAnswers: correctAnswers,
                    explanation: question.explanation || ''
                  };
                  
                  console.log('🔄 Question transform:', {
                    original: question.text,
                    correctAnswers: correctAnswers,
                    optionsCount: transformedQuestion.options.length
                  });
                  
                  return transformedQuestion;
                })
              },
              // Don't remove questions field - keep both for compatibility
              // The backend should prioritize quiz.questions over lecture.questions
              graded: undefined,
              passingScore: undefined
            };
            
            console.log('✅ Transformed quiz questions count:', transformedQuiz.quiz.questions.length);
            return transformedQuiz;
          }
          return lecture;
        })
      })) || [];

      console.log('📤 Final transformed sections for API:', JSON.stringify(transformedSections, null, 2));

      // Add basic course data
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      formData.append('whatYouWillLearn', JSON.stringify(data.whatYouWillLearn || []));
      formData.append('requirements', JSON.stringify(data.requirements || []));
      formData.append('sections', JSON.stringify(transformedSections));
      formData.append('isPublished', data.isPublished.toString());
      
      // Add files if they exist
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      if (bannerFile) {
        formData.append('banner', bannerFile);
      }
      if (demoVideoFile) {
        formData.append('demoVideo', demoVideoFile);
      }
      
      // First save the course to get IDs for sections/lectures
      const savedCourse = await onSave(formData);
      if (!savedCourse) {
        throw new Error("Failed to save course");
      }

      console.log('Course saved:', savedCourse);
      console.log('🔍 savedCourse._id:', savedCourse?._id);
      console.log('🔍 savedCourse.course?._id:', savedCourse?.course?._id);
      console.log('🔍 savedCourse.course?.isPublished:', savedCourse?.course?.isPublished);
      console.log('🔍 Full savedCourse structure:', JSON.stringify(savedCourse, null, 2));
      
      // Store the course ID for later use
      const courseId = savedCourse._id || savedCourse?.course?._id;
      setSavedCourseId(courseId);

      // Track uploaded videos for form refresh later
      let uploadedVideoInfo: Array<{sectionIndex: number, lectureIndex: number, videoData: any}> = [];

      // Now handle video uploads to api.video for any lectures with video files
      const courseFormElement = document.querySelector('[data-course-form]') as any;
      let hasVideoUploads = false;
      
      console.log('🔍 Checking for video files...');
      console.log('courseFormElement:', courseFormElement);
      console.log('lectureVideoFiles:', courseFormElement?.lectureVideoFiles);
      
      if (courseFormElement?.lectureVideoFiles) {
        const videoFiles = Object.entries(courseFormElement.lectureVideoFiles);
        console.log('Found video files to upload:', videoFiles.length);
        
        if (videoFiles.length > 0) {
          hasVideoUploads = true;
          const { coursesApi } = await import('@/lib/api');
          
          // Set flag to prevent form resets during upload
          isUploadingVideosRef.current = true;
          
          // Show the upload progress modal now that course is saved
          console.log('📹 Showing upload progress modal, setting isUploadingVideos=true');
          showUploadProgress();
          
          console.log('📹 Upload progress modal state set:', {
            isVisible: true,
            progress: 0,
            fileName: '',
            isComplete: false,
            isError: false,
            errorMessage: ''
          });
          
          for (const [lectureNamePrefix, files] of videoFiles) {
            const { videoFile, thumbnailFile: lectureThumbnailFile } = files as any;
            
            if (videoFile) {
              console.log(`Processing video upload for ${lectureNamePrefix}:`, videoFile.name);
              
              // Update modal with current file being processed
              setUploadFileName(videoFile.name);
              
              // Extract section and lecture indices from namePrefix (e.g., "sections.0.lectures.1")
              const pathParts = lectureNamePrefix.split('.');
              const sectionIndex = parseInt(pathParts[1]);
              const lectureIndex = parseInt(pathParts[3]);
              
              console.log('� Simple upload approach:', {
                courseId: savedCourse._id,
                sectionIndex,
                lectureIndex,
                videoFileName: videoFile.name,
                videoSize: videoFile.size,
                thumbnailName: thumbnailFile?.name || 'none'
              });
              
              // Get course ID from different possible response structures
              const courseId = savedCourse._id || savedCourse?.course?._id || (course && course._id);
              
              console.log('📹 Simple upload approach:', {
                courseId,
                sectionIndex,
                lectureIndex,
                videoFileName: videoFile.name,
                videoSize: videoFile.size,
                thumbnailName: thumbnailFile?.name || 'none',
                savedCourseStructure: Object.keys(savedCourse || {})
              });
              
              if (!courseId) {
                console.error('❌ No course ID found in any location:', {
                  savedCourse_id: savedCourse._id,
                  savedCourse_course_id: savedCourse?.course?._id,
                  props_course_id: course?._id
                });
                throw new Error('Course ID not found for video upload');
              }
              
              try {
                console.log('📹 Starting simple video upload to api.video...');
                const videoResult = await coursesApi.uploadVideo(
                  courseId,
                  sectionIndex,
                  lectureIndex,
                  videoFile,
                  lectureThumbnailFile || undefined,
                  (progress) => {
                    // Update progress in real-time
                    console.log('📹 CourseBuilderForm received progress:', progress);
                    updateUploadProgress(progress);
                    console.log('📹 Called updateUploadProgress with:', progress);
                  }
                );

                console.log('📹 Video uploaded successfully:', videoResult);
                
                // Update the form with the returned video data immediately
                if (videoResult.videoData && videoResult.lecture) {
                  const currentFormValues = form.getValues();
                  const updatedSections = [...currentFormValues.sections];
                  
                  // Update the specific lecture with video data
                  if (updatedSections[sectionIndex] && updatedSections[sectionIndex].lectures[lectureIndex]) {
                    const currentLecture = updatedSections[sectionIndex].lectures[lectureIndex];
                    updatedSections[sectionIndex].lectures[lectureIndex] = {
                      ...currentLecture,
                      video: {
                        apiVideoId: videoResult.videoData.apiVideoId,
                        embedUrl: videoResult.videoData.embedUrl,
                        playerUrl: videoResult.videoData.playerUrl,
                        thumbnailUrl: videoResult.videoData.thumbnailUrl,
                        hlsUrl: videoResult.videoData.hlsUrl,
                        mp4Url: videoResult.videoData.mp4Url,
                        duration: videoResult.videoData.duration || 0,
                        isProcessing: false
                      }
                    };
                    
                    // Update form state immediately
                    form.setValue('sections', updatedSections);
                    
                    console.log('📹 Form updated with video data:', {
                      sectionIndex,
                      lectureIndex,
                      apiVideoId: videoResult.videoData.apiVideoId,
                      embedUrl: videoResult.videoData.embedUrl
                    });

                    // Auto-trigger Save Draft after 1 second
                    setTimeout(() => {
                      console.log('💾 Auto-triggering Save Draft after video upload...');
                      form.handleSubmit(onSubmit)();
                    }, 1000);
                  }
                }
                
                // Store uploaded video info for later course refresh
                if (!uploadedVideoInfo) {
                  uploadedVideoInfo = [];
                }
                uploadedVideoInfo.push({
                  sectionIndex,
                  lectureIndex,
                  videoData: videoResult.videoData
                });
              } catch (videoError) {
                console.error('📹 Video upload failed:', videoError);
                
                // Show error in progress modal
                setUploadError((videoError as Error).message || 'Upload failed');
                
                // Clear flag on error to allow form resets again
                isUploadingVideosRef.current = false;
                
                // Don't throw here - allow course save to complete even if video upload fails
              }
            }
          }
          
          // Mark all uploads as complete
          setUploadComplete(() => {
            // Stay on the same page after upload completion
            console.log('📹 Upload complete - staying on current page');
          });
          
          // Clear flag to allow form resets again
          isUploadingVideosRef.current = false;
          
          // Clear the stored video files after processing
          courseFormElement.lectureVideoFiles = {};
        }
      }

      // Show toast notification
      toast({
        title: "Course Saved!",
        description: hasVideoUploads ? 
          "Course saved and videos processed!" : 
          "Your changes have been saved successfully.",
      });
      
      // Stay on current page - no redirect after save
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: error.message || "There was a problem saving your course. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Note: Removed auto-save for thumbnails and banners to prevent infinite loops
  // Users can manually save after uploading files using the "Save Draft" button

  // Listen for custom save events from video uploads
  React.useEffect(() => {
    const handleCourseSave = () => {
      console.log('💾 Received triggerCourseSave event');
      form.handleSubmit(onSubmit)();
    };

    window.addEventListener('triggerCourseSave', handleCourseSave);
    return () => {
      window.removeEventListener('triggerCourseSave', handleCourseSave);
    };
  }, []);



  const handlePublishToggle = async (published: boolean) => {
    console.log('🔄 Publish toggle clicked:', { published, currentValue: form.getValues('isPublished') });
    
    try {
      // Set the value in form immediately for UI feedback
      form.setValue('isPublished', published);
      
      // Create FormData with only the necessary fields for publish toggle
      const formData = new FormData();
      const currentValues = form.getValues();
      
      // Add all required fields for the update
      formData.append('title', currentValues.title);
      formData.append('description', currentValues.description);
      formData.append('price', currentValues.price.toString());
      formData.append('category', currentValues.category);
      formData.append('whatYouWillLearn', JSON.stringify(currentValues.whatYouWillLearn || []));
      formData.append('requirements', JSON.stringify(currentValues.requirements || []));
      formData.append('sections', JSON.stringify(currentValues.sections || []));
      formData.append('isPublished', published.toString());
      
      // Call the onSave function directly instead of triggering full form submission
      console.log('📝 Updating publish status:', published);
      const savedCourse = await onSave(formData);
      
      if (savedCourse && (savedCourse.isPublished !== undefined || savedCourse.status !== undefined)) {
        // Update form with returned course data to ensure sync
        const updatedPublishStatus = savedCourse.isPublished || savedCourse.status === 'published';
        form.setValue('isPublished', updatedPublishStatus);
        
        console.log('✅ Publish status updated successfully', {
          requested: published,
          actual: updatedPublishStatus,
          courseStatus: savedCourse.status
        });
        
        // Show success message
        toast({
          title: "Success",
          description: `Course ${updatedPublishStatus ? 'published' : 'unpublished'} successfully!`,
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to update publish status:', error);
      // Revert the toggle on error
      form.setValue('isPublished', !published);
      
      toast({
        title: "Error",
        description: "Failed to update publish status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentLecture = activeLecture ? form.getValues(`sections.${activeLecture.sectionIndex}.lectures.${activeLecture.lectureIndex}`) : null;

  return (
    <FormProvider {...form}>
      <div className="grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      activeStep === step.id && "bg-muted text-primary"
                    )}
                  >
                    <step.icon className="h-4 w-4" />
                    {step.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full overflow-hidden">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
              <Link href="/instructor/courses"><ChevronLeft /></Link>
            </Button>
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold truncate">
                {course ? `Editing: ${form.watch('title')}` : "Create New Course"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormLabel className="text-sm font-medium">Publish</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handlePublishToggle}
                    />
                  </FormItem>
                )}
              />
              <Button onClick={async () => {
                console.log('🔘 Save Draft button clicked');
                console.log('🔍 Form is valid:', form.formState.isValid);
                console.log('🔍 Form errors:', form.formState.errors);
                
                // Try to validate manually to see what fails
                const currentValues = form.getValues();
                console.log('🔍 Current form values:', currentValues);
                
                try {
                  const validationResult = courseBuilderSchema.safeParse(currentValues);
                  if (!validationResult.success) {
                    console.log('❌ Manual validation failed:', validationResult.error.issues);
                    console.log('❌ Detailed validation errors:', JSON.stringify(validationResult.error.issues, null, 2));
                  } else {
                    console.log('✅ Manual validation passed');
                  }
                } catch (error) {
                  console.log('❌ Schema validation error:', error);
                }
                
                form.handleSubmit(onSubmit)();
              }} disabled={isSaving} size="sm">
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Form {...form}>
              <form id="course-builder-form" data-course-form className="p-4 lg:p-6 space-y-6">
                <div className={activeStep === "info" ? "" : "hidden"}>
                  <BasicInfoStep 
                    categories={categories}
                    thumbnailFile={thumbnailFile}
                    setThumbnailFile={setThumbnailFile}
                    bannerFile={bannerFile}
                    setBannerFile={setBannerFile}
                    demoVideoFile={demoVideoFile}
                    setDemoVideoFile={setDemoVideoFile}
                    existingThumbnail={course?.thumbnail?.url}
                    existingBanner={course?.banner?.url}
                    existingDemoVideo={course?.demoVideo?.url}
                  />
                </div>
              <div className={`${activeStep === "curriculum" ? "grid md:grid-cols-2 flex-1 -m-4 lg:-m-6" : "hidden"}`}>
                <CurriculumStep setActiveLecture={setActiveLecture} />
                <div className="bg-muted/20 p-8 border-l overflow-y-auto">
                  {currentLecture ? (
                    <LectureEditor key={`${activeLecture?.sectionIndex}-${activeLecture?.lectureIndex}`} activeLecture={activeLecture!} lecture={currentLecture} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Select a lecture to edit its content.</p>
                    </div>
                  )}
                </div>
              </div>
                <div className={activeStep === "landing" ? "" : "hidden"}>
                  <LandingPageStep />
                </div>
              </form>
            </Form>
          </main>
        </div>
      </div>
    </FormProvider>
  );
}

function FileInput({
  icon,
  label,
  description,
  accept,
  file,
  setFile,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  accept?: string;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center space-y-2 cursor-pointer hover:border-primary/50 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
    >
      {file ? (
        <div className="flex flex-col items-center gap-2 text-primary">
          <FileIcon className="h-12 w-12" />
          <p className="font-semibold">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-destructive"
          >
            Remove file
          </Button>
        </div>
      ) : (
        <>
          {icon}
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept={accept}
          />
        </>
      )}
    </div>
  );
}


interface BasicInfoStepProps {
  categories: Array<{_id: string, name: string}>;
  thumbnailFile: File | null;
  setThumbnailFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  demoVideoFile: File | null;
  setDemoVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
  existingThumbnail?: string;
  existingBanner?: string;
  existingDemoVideo?: string;
}

function BasicInfoStep({ 
  categories, 
  thumbnailFile, 
  setThumbnailFile, 
  bannerFile, 
  setBannerFile, 
  demoVideoFile, 
  setDemoVideoFile,
  existingThumbnail,
  existingBanner,
  existingDemoVideo
}: BasicInfoStepProps) {
  const { control } = useFormContext();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-xl font-bold font-headline">Basic Information</h2>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g., The Complete Web Development Bootcamp" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief summary of your course."
                rows={5}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="29.99" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <WhatYouWillLearnEditor />
      <RequirementsEditor />
       <FormItem>
          <FormLabel>Course Thumbnail</FormLabel>
          <FileInput
            file={thumbnailFile}
            setFile={setThumbnailFile}
            icon={<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />}
            label="Drag & drop your thumbnail image"
            description="or click to browse"
            accept="image/*"
          />
          {existingThumbnail && !thumbnailFile && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Current thumbnail:</p>
              <img src={`http://localhost:5000${existingThumbnail}`} alt="Current thumbnail" className="w-32 h-20 object-cover rounded border mt-1" />
            </div>
          )}
          <FormDescription>The image shown in course listings. Recommended: 16:9 aspect ratio.</FormDescription>
       </FormItem>
       <FormItem>
          <FormLabel>Course Banner</FormLabel>
          <FileInput
            file={bannerFile}
            setFile={setBannerFile}
            icon={<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />}
            label="Drag & drop your banner image"
            description="or click to browse"
            accept="image/*"
          />
          {existingBanner && !bannerFile && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Current banner:</p>
              <img src={`http://localhost:5000${existingBanner}`} alt="Current banner" className="w-32 h-20 object-cover rounded border mt-1" />
            </div>
          )}
          <FormDescription>The large image at the top of your course landing page.</FormDescription>
       </FormItem>
       <FormItem>
          <FormLabel>Demo Video</FormLabel>
           <FileInput
            file={demoVideoFile}
            setFile={setDemoVideoFile}
            icon={<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />}
            label="Drag & drop your preview video"
            description="or click to browse"
            accept="video/*"
          />
          {existingDemoVideo && !demoVideoFile && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Current demo video:</p>
              <video src={`http://localhost:5000${existingDemoVideo}`} className="w-32 h-20 object-cover rounded border mt-1" controls />
            </div>
          )}
          <FormDescription>A short video to give students a taste of your course.</FormDescription>
       </FormItem>
    </div>
  );
}

function WhatYouWillLearnEditor() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "whatYouWillLearn",
    });

    return (
        <FormItem>
            <FormLabel>What you'll learn</FormLabel>
            <FormDescription>List the key skills students will gain from this course.</FormDescription>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={control}
                            name={`whatYouWillLearn.${index}`}
                            render={({ field }) => (
                                <Input {...field} placeholder={`e.g., Build professional websites`}/>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
             <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Learning Objective
            </Button>
        </FormItem>
    )
}

function RequirementsEditor() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "requirements",
    });

    return (
        <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormDescription>List what students need to know or have before starting the course.</FormDescription>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={control}
                            name={`requirements.${index}`}
                            render={({ field }) => (
                                <Input {...field} placeholder={`e.g., Basic JavaScript knowledge`}/>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
             <Button type="button" variant="outline" size="sm" onClick={() => append('')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Requirement
            </Button>
        </FormItem>
    )
}


function CurriculumStep({ setActiveLecture }: { setActiveLecture: (coords: {sectionIndex: number, lectureIndex: number} | null) => void}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const addNewSection = () => {
    append({ title: `Section ${fields.length + 1}`, lectures: [], order: fields.length + 1 });
  };
  
  return (
    <div className="space-y-6 p-8 border-r bg-background overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-headline">Curriculum</h2>
        <Button type="button" variant="outline" onClick={addNewSection}>Add Section</Button>
      </div>
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={['item-0']}>
        {fields.map((section, sectionIndex) => (
           <AccordionItem value={`item-${sectionIndex}`} key={section.id} className="bg-background border rounded-lg">
             <AccordionTrigger className="hover:no-underline px-4">
                <div className="flex items-center gap-2 w-full">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <FormField
                    control={control}
                    name={`sections.${sectionIndex}.title`}
                    render={({ field }) => (
                        <Input {...field} className="text-lg font-semibold border-none focus-visible:ring-0 bg-transparent" />
                    )}
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); remove(sectionIndex); }}>
                        <Trash2 className="w-4 h-4"/>
                    </Button>
                </div>
             </AccordionTrigger>
             <AccordionContent className="p-4 pt-0">
                <LectureList sectionIndex={sectionIndex} setActiveLecture={setActiveLecture}/>
             </AccordionContent>
           </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function LectureList({ sectionIndex, setActiveLecture }: { sectionIndex: number, setActiveLecture: (coords: {sectionIndex: number, lectureIndex: number} | null) => void }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.lectures`
  });

  const addLecture = (type: Lecture['type']) => {
    const newLecture = { 
        title: `New ${type}`, 
        type, 
        duration: 5,
        description: '',
        content: '',
        questions: type === 'quiz' ? [] : undefined,
        graded: type === 'quiz' ? true : undefined,
        order: fields.length + 1,
    };
    append(newLecture);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, lectureIndex) => {
        const lecture = field as unknown as Lecture;
        return (
          <div 
              key={field.id} 
              className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border cursor-pointer hover:bg-muted/100"
              onClick={() => setActiveLecture({sectionIndex, lectureIndex})}
          >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0"/>
              {lecture.type === 'video' && <Video className="w-4 h-4 text-muted-foreground shrink-0" />}
              {lecture.type === 'quiz' && <HelpCircle className="w-4 h-4 text-muted-foreground shrink-0" />}
              {lecture.type === 'note' && <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
              <span className="flex-grow text-sm">{lecture.title}</span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setActiveLecture(null); remove(lectureIndex);}}>
                  <Trash2 className="w-4 h-4" />
              </Button>
          </div>
        );
      })}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={() => addLecture('video')}><PlusCircle className="mr-2 h-4 w-4"/>Video</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addLecture('quiz')}><PlusCircle className="mr-2 h-4 w-4"/>Quiz</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => addLecture('note')}><PlusCircle className="mr-2 h-4 w-4"/>Note</Button>
      </div>
    </div>
  )
}


function LectureEditor({ lecture, activeLecture }: { lecture: any, activeLecture: { sectionIndex: number, lectureIndex: number } }) {
  const { control } = useFormContext();
  const namePrefix = `sections.${activeLecture.sectionIndex}.lectures.${activeLecture.lectureIndex}`;

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name={`${namePrefix}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lecture Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {lecture.type === 'video' && (
        <>
          <div className="text-sm text-blue-600 mb-2">🎥 Video Lecture Editor Active</div>
          <VideoLectureEditor namePrefix={namePrefix} />
        </>
      )}
      {lecture.type === 'quiz' && <QuizLectureEditor namePrefix={namePrefix} />}
      {lecture.type === 'note' && <NoteLectureEditor namePrefix={namePrefix} />}
    </div>
  );
}

function VideoLectureEditor({ namePrefix }: { namePrefix: string }) {
    console.log('🎥 VideoLectureEditor rendered for:', namePrefix);
    
    const { control, getValues } = useFormContext();
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [videoThumbnailFile, setVideoThumbnailFile] = React.useState<File | null>(null);
    const [captionsFile, setCaptionsFile] = React.useState<File | null>(null);
    
    // Wrapped setVideoFile with logging and auto-save
    const handleSetVideoFile = React.useCallback((value: React.SetStateAction<File | null>) => {
        const file = typeof value === 'function' ? value(videoFile) : value;
        console.log('📁 setVideoFile called with:', file ? `${file.name} (${file.size} bytes)` : 'null');
        setVideoFile(file);
        
        // Auto-save when video file is selected
        if (file) {
            console.log('📹 Auto-triggering Save Draft after video file selection...');
            setTimeout(() => {
                // Use window event to communicate with parent
                window.dispatchEvent(new CustomEvent('triggerCourseSave'));
            }, 1000);
        }
    }, [videoFile]);
    
    const handleSetVideoThumbnailFile = React.useCallback((value: React.SetStateAction<File | null>) => {
        const file = typeof value === 'function' ? value(videoThumbnailFile) : value;
        console.log('📁 setVideoThumbnailFile called with:', file ? `${file.name} (${file.size} bytes)` : 'null');
        setVideoThumbnailFile(file);
        
        // Auto-save when video thumbnail file is selected
        if (file) {
            console.log('🖼️ Auto-triggering Save Draft after video thumbnail selection...');
            setTimeout(() => {
                // Use window event to communicate with parent
                window.dispatchEvent(new CustomEvent('triggerCourseSave'));
            }, 1000);
        }
    }, [videoThumbnailFile]);
    
    // Check if video is already uploaded
    const currentLecture = getValues(namePrefix);
    const hasExistingVideo = currentLecture?.video?.apiVideoId;
    
    console.log('📹 Current lecture data:', currentLecture);
    console.log('📹 Has existing video:', hasExistingVideo);

    // Store video files in a way that the parent form can access them
    React.useEffect(() => {
        console.log(`🔍 useEffect triggered for ${namePrefix}:`, {
            videoFile: videoFile ? `${videoFile.name} (${videoFile.size} bytes)` : 'null',
            videoThumbnailFile: videoThumbnailFile ? videoThumbnailFile.name : 'null',
            namePrefix
        });
        
        const courseBuilderForm = document.querySelector('#course-builder-form') || document.querySelector('[data-course-form]') as any;
        console.log('🔍 Found courseBuilderForm:', !!courseBuilderForm);
        
        if (!courseBuilderForm) {
          console.log('❌ No course form found! Trying alternative selectors...');
          const formElement = document.querySelector('form');
          console.log('🔍 Found any form:', !!formElement);
          if (formElement) {
            console.log('🔧 Using fallback form element');
          }
        }
        
        let formElement = courseBuilderForm;
        if (!formElement) {
          console.log('❌ Trying fallback form selector...');
          formElement = document.querySelector('form');
          console.log('🔍 Found fallback form:', !!formElement);
        }
        
        if (formElement && videoFile) {
            if (!formElement.lectureVideoFiles) {
                formElement.lectureVideoFiles = {};
                console.log('📁 Initialized lectureVideoFiles object');
            }
            
            formElement.lectureVideoFiles[namePrefix] = {
                videoFile,
                thumbnailFile: videoThumbnailFile
            };
            
            console.log(`📁 Stored video file for ${namePrefix}:`, {
                fileName: videoFile.name,
                fileSize: videoFile.size,
                thumbnailFile: videoThumbnailFile?.name || 'none'
            });
            console.log('📁 Total stored video files:', Object.keys(formElement.lectureVideoFiles).length);
            console.log('📁 All stored files:', Object.keys(formElement.lectureVideoFiles));
        } else if (formElement && !videoFile) {
            console.log('⚠️ formElement found but no videoFile to store');
        } else if (!formElement && videoFile) {
            console.log('⚠️ videoFile exists but formElement not found');
        }
    }, [videoFile, videoThumbnailFile, namePrefix]);

    return (
        <div className="space-y-6">
            {hasExistingVideo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Video uploaded to api.video</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Video ID: </span>
                            <span className="text-green-600 font-mono">{currentLecture.video.apiVideoId}</span>
                        </div>
                        
                        {currentLecture.video.thumbnailUrl && (
                            <div>
                                <span className="font-medium text-gray-700">Thumbnail: </span>
                                <a 
                                    href={currentLecture.video.thumbnailUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    View Thumbnail
                                </a>
                            </div>
                        )}
                        
                        {currentLecture.video.duration && (
                            <div>
                                <span className="font-medium text-gray-700">Duration: </span>
                                <span className="text-gray-600">{Math.round(currentLecture.video.duration / 60)} minutes</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                        {currentLecture.video.playerUrl && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(currentLecture.video.playerUrl, '_blank')}
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Preview Video
                            </Button>
                        )}
                        
                        {currentLecture.video.embedUrl && (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(currentLecture.video.embedUrl);
                                    // Could add toast notification here
                                }}
                            >
                                Copy Embed URL
                            </Button>
                        )}
                    </div>
                    
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Uploading a new video will replace the existing one in api.video.
                        </p>
                    </div>
                </div>
            )}

             <FormField
                control={control}
                name={`${namePrefix}.duration`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Video Duration</FormLabel>
                    <FormControl>
                        <DurationInput 
                          value={field.value || 0} 
                          onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormItem>
                <FormLabel>Video Content</FormLabel>
                <FileInput
                  file={videoFile}
                  setFile={handleSetVideoFile}
                  icon={<UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />}
                  label="Drag & drop your video here"
                  description="or click to browse"
                  accept="video/*"
                />
                {videoFile && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">{videoFile.name}</p>
                        <p className="text-xs text-gray-600">
                            Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                )}
            </FormItem>

             <FormItem>
                <FormLabel>Video Thumbnail (Optional)</FormLabel>
                 <FileInput
                  file={videoThumbnailFile}
                  setFile={handleSetVideoThumbnailFile}
                  icon={<ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />}
                  label="Drag & drop your thumbnail"
                  description="or click to browse"
                  accept="image/*"
                />
                <FormDescription>Recommended size: 1280x720 pixels</FormDescription>
            </FormItem>



             <FormField
                control={control}
                name={`${namePrefix}.description`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Video Description</FormLabel>
                    <FormControl>
                      <QuillEditor
                        key={`video-desc-${namePrefix}`}
                        value={field.value as unknown as string}
                        onChange={(html) => field.onChange(html)}
                        placeholder="A brief summary of the video content."
                        className="border rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormItem>
                <FormLabel>Captions (optional)</FormLabel>
                 <FileInput
                  file={captionsFile}
                  setFile={setCaptionsFile}
                  icon={<FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />}
                  label="Drag & drop your captions file"
                  description="(.vtt or .srt)"
                  accept=".vtt,.srt"
                />
            </FormItem>
        </div>
    )
}

function QuizLectureEditor({ namePrefix }: { namePrefix: string }) {
  const { control, getValues, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${namePrefix}.questions`,
  });

  const isGraded = watch(`${namePrefix}.graded`);
  const questions = watch(`${namePrefix}.questions`) || [];

  // Check if quiz has validation errors
  const getQuizValidationErrors = () => {
    const errors: string[] = [];
    
    if (questions.length === 0) {
      errors.push("Add at least one question");
    }
    
    questions.forEach((question: any, questionIndex: number) => {
      if (!question.text?.trim()) {
        errors.push(`Question ${questionIndex + 1}: Enter question text`);
      }
      
      const options = question.options || [];
      if (options.length < 2) {
        errors.push(`Question ${questionIndex + 1}: Add at least 2 options`);
      }
      
      const hasEmptyOption = options.some((option: any) => !option.text?.trim());
      if (hasEmptyOption) {
        errors.push(`Question ${questionIndex + 1}: Fill in all option texts`);
      }
      
      const hasCorrectAnswer = options.some((option: any) => option.isCorrect);
      if (!hasCorrectAnswer) {
        errors.push(`Question ${questionIndex + 1}: Select at least one correct answer`);
      }
    });
    
    return errors;
  };

  const validationErrors = getQuizValidationErrors();

  const addQuestion = (type: 'single-choice' | 'multiple-choice') => {
    append({
      id: `q-${Date.now()}`,
      text: '',
      type,
      options: [
        { text: '', isCorrect: type === 'single-choice' ? true : false },
        { text: '', isCorrect: false }
      ],
    });
  };

  // Update passing score when graded toggle changes
  React.useEffect(() => {
    const currentPassingScore = getValues(`${namePrefix}.passingScore`);
    
    if (isGraded && (!currentPassingScore || currentPassingScore === 0)) {
      setValue(`${namePrefix}.passingScore`, 75);
    } else if (!isGraded) {
      setValue(`${namePrefix}.passingScore`, 0);
    }
  }, [isGraded, setValue, getValues, namePrefix]);

  return (
    <div className="space-y-6">
      {/* Quiz validation errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 mb-1">
            Complete quiz information before saving:
          </p>
          <ul className="text-sm text-red-600 space-y-1">
            {validationErrors.slice(0, 3).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
            {validationErrors.length > 3 && (
              <li>• ...and {validationErrors.length - 3} more errors</li>
            )}
          </ul>
        </div>
      )}
      
        <FormField
            control={control}
            name={`${namePrefix}.duration`}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Estimated Quiz Duration</FormLabel>
                <FormControl>
                    <DurationInput 
                      value={field.value || 0} 
                      onChange={field.onChange}
                    />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
      
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Quiz Questions</h3>
        <div className="flex items-center gap-4">
          <FormField
            control={control}
            name={`${namePrefix}.graded`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch 
                    checked={field.value || false} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <FormLabel>Graded Quiz</FormLabel>
              </FormItem>
            )}
          />
          {isGraded && (
            <FormField
              control={control}
              name={`${namePrefix}.passingScore`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormLabel className="text-sm">Passing Score:</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      className="w-16 h-8" 
                      min="0" 
                      max="100"
                    />
                  </FormControl>
                  <span className="text-sm text-muted-foreground">%</span>
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {fields.map((question, qIndex) => (
        <div key={question.id} className="p-4 border rounded-lg bg-background space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <FormField
                control={control}
                name={`${namePrefix}.questions.${qIndex}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question {qIndex + 1}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter question ${qIndex + 1}`} {...field} className="font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Controller
                control={control}
                name={`${namePrefix}.questions.${qIndex}.type`}
                render={({ field: { value } }) => (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="px-2 py-1 bg-muted rounded text-sm font-medium capitalize">
                      {value === 'single-choice' ? 'Single Choice' : 'Multiple Choice'}
                    </span>
                  </div>
                )}
              />
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(qIndex)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <QuestionOptions 
            namePrefix={`${namePrefix}.questions.${qIndex}`} 
            type={getValues(`${namePrefix}.questions.${qIndex}.type`)}
          />
        </div>
      ))}
      
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => addQuestion('single-choice')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Single Choice Question
        </Button>
        <Button type="button" variant="outline" onClick={() => addQuestion('multiple-choice')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Multiple Choice Question
        </Button>
      </div>
    </div>
  );
}

function QuestionOptions({ namePrefix, type }: { namePrefix: string, type: 'single-choice' | 'multiple-choice' }) {
    const { control, setValue, getValues, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `${namePrefix}.options`
    });

    const options = watch(`${namePrefix}.options`) || [];

    const handleSingleChoiceChange = (selectedIndex: number) => {
        // For single choice, only one option can be correct
        fields.forEach((_, index) => {
            setValue(`${namePrefix}.options.${index}.isCorrect`, index === selectedIndex);
        });
    };
    
    const singleChoiceValue = options.findIndex((o: any) => o.isCorrect);

    // Ensure at least one option is correct for single choice questions
    React.useEffect(() => {
        if (type === 'single-choice' && options.length > 0) {
            const hasCorrectAnswer = options.some((o: any) => o.isCorrect);
            if (!hasCorrectAnswer) {
                setValue(`${namePrefix}.options.0.isCorrect`, true);
            }
        }
    }, [type, options, setValue, namePrefix]);

    const handleRemoveOption = (index: number) => {
        // Don't allow removing if only 2 options left
        if (fields.length <= 2) {
            return;
        }
        
        // If removing the correct answer in single choice, make the first remaining option correct
        if (type === 'single-choice' && options[index]?.isCorrect && fields.length > 2) {
            const newCorrectIndex = index === 0 ? 1 : 0;
            setValue(`${namePrefix}.options.${newCorrectIndex}.isCorrect`, true);
        }
        
        remove(index);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Answer Options</Label>
                <span className="text-xs text-muted-foreground">
                    {type === 'single-choice' ? 'Select one correct answer' : 'Check all correct answers'}
                </span>
            </div>
            
            {type === 'single-choice' ? (
                <Controller
                    control={control}
                    name={`${namePrefix}.options`}
                    render={() => (
                        <RadioGroup
                            onValueChange={(value) => handleSingleChoiceChange(parseInt(value, 10))}
                            value={singleChoiceValue >= 0 ? singleChoiceValue.toString() : "0"}
                            className="space-y-2"
                        >
                            {fields.map((option, oIndex) => (
                                <div key={option.id} className="flex items-center gap-3 p-2 rounded border bg-muted/20">
                                    <RadioGroupItem value={oIndex.toString()} id={`${namePrefix}-o-${oIndex}`} />
                                    <FormField
                                        control={control}
                                        name={`${namePrefix}.options.${oIndex}.text`}
                                        render={({ field }) => (
                                            <Input 
                                                placeholder={`Option ${oIndex + 1}`} 
                                                {...field} 
                                                className="flex-grow bg-background" 
                                            />
                                        )}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => handleRemoveOption(oIndex)}
                                        disabled={fields.length <= 2}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                />
            ) : (
                <div className="space-y-2">
                    {fields.map((option, oIndex) => (
                        <div key={option.id} className="flex items-center gap-3 p-2 rounded border bg-muted/20">
                            <FormField
                                control={control}
                                name={`${namePrefix}.options.${oIndex}.isCorrect`}
                                render={({ field }) => (
                                    <Checkbox 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                        className="mt-1"
                                    />
                                )}
                            />
                            <FormField
                                control={control}
                                name={`${namePrefix}.options.${oIndex}.text`}
                                render={({ field }) => (
                                    <Input 
                                        placeholder={`Option ${oIndex + 1}`} 
                                        {...field} 
                                        className="flex-grow bg-background" 
                                    />
                                )}
                            />
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => handleRemoveOption(oIndex)}
                                disabled={fields.length <= 2}
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            
            <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ text: '', isCorrect: false })}
                className="w-full"
            >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Option
            </Button>
        </div>
    )
}

function NoteLectureEditor({ namePrefix }: { namePrefix: string }) {
    const { control } = useFormContext();
    return (
        <div className="space-y-6">
            <FormField
                control={control}
                name={`${namePrefix}.duration`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Estimated Reading Duration</FormLabel>
                    <FormControl>
                        <DurationInput 
                          value={field.value || 0} 
                          onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`${namePrefix}.content`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Note Content</FormLabel>
                    <FormControl>
                      <QuillEditor
                        key={`note-content-${namePrefix}`}
                        value={field.value as unknown as string}
                        onChange={(html) => field.onChange(html)}
                        placeholder="Write your notes here."
                        className="border rounded-md min-h-[300px]"
                      />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
    )
}

function LandingPageStep() {
  const { control } = useFormContext();
  const courseData = useWatch({ control });

  // Create a mock course object for the preview
  const previewCourse: Course = {
    _id: "preview-id",
    id: "preview-id",
    instructor: "user-1", // You might want to get this from auth context
    instructorId: "user-1",
    title: courseData.title || "Course Title",
    description: courseData.description || "Course description",
    category: courseData.category || "General",
    sections: courseData.sections || [],
    status: 'published',
    ...courseData,
    price: Number(courseData.price) || 0,
    isPublished: true, // Show it as if it's published for the preview
  };

  return (
    <div className="bg-muted/40 -m-4 lg:-m-6 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold font-headline mb-4">Landing Page Preview</h2>
        <p className="text-muted-foreground mb-6">This is a live preview of how students will see your course.</p>
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
           <CourseLandingPreview course={previewCourse} />
        </div>
      </div>
    </div>
  );
}
