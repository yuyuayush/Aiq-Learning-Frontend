export type UserRole = "learner" | "instructor";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarId: string;
  bio?: string;
}

export interface VideoData {
  apiVideoId?: string;
  embedUrl?: string;
  playerUrl?: string;
  thumbnailUrl?: string;
  hlsUrl?: string;
  mp4Url?: string;
  duration?: number;
  isProcessing?: boolean;
}

export interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

export interface QuizData {
  isGraded?: boolean;
  instructions?: string;
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  questions: QuizQuestion[];
}

export interface NoteData {
  content?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
}

export interface Lecture {
  id?: string;
  _id?: string; // MongoDB ID
  title: string;
  description?: string;
  type: "video" | "quiz" | "note";
  order?: number;
  isPreview?: boolean;
  duration: number; // in minutes
  
  // Video lecture fields
  video?: VideoData;
  
  // Quiz lecture fields
  quiz?: QuizData;
  
  // Note lecture fields
  note?: NoteData;
  
  // Common resources
  resources?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  
  // Legacy fields for backward compatibility
  content?: string;
}

export interface Section {
  id?: string;
  _id?: string; // MongoDB ID
  title: string;
  lectures: Lecture[];
}

export interface Course {
  _id: string;
  id?: string; // For backward compatibility
  title: string;
  description: string;
  shortDescription?: string;
  category: string | { _id: string; name: string };
  instructor: string;
  instructorId?: string; // For backward compatibility
  price: number;
  originalPrice?: number;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  banner?: {
    url: string;
    publicId: string;
  };
  demoVideo?: {
    url: string;
    publicId: string;
  };
  thumbnailId?: string; // For backward compatibility
  bannerId?: string; // For backward compatibility
  previewVideoUrl?: string; // For backward compatibility
  requirements?: string[];
  whatYouWillLearn?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  isPublished: boolean;
  sections: Section[];
  totalDuration?: number;
  enrollmentCount?: number;
  averageRating?: number;
  certificate?: {
    enabled: boolean;
    completionRequirement: number;
    passingScore: number;
    signedBy: {
      name: string;
      title: string;
      signature: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id:string;
  userId: string;
  courseId: string;
  progress: number; // percentage
  completed: boolean;
  enrollmentDate: string;
}

export interface Review {
  id: string;
  userId: string;
  courseId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issueDate: string;
}

export interface WishlistItem {
  userId: string;
  courseId: string;
}

export interface CartItem {
  userId: string;
  courseId: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  lectureId: string;
  score: number;
  timestamp: string;
}
