

// @ts-nocheck
import type {
  User,
  Course,
  Enrollment,
  Review,
  Certificate,
  WishlistItem,
  CartItem,
  Section,
  Lecture,
  QuizAttempt,
} from "./types";

// Mock Database
let users: User[] = [
  {
    id: "user-1",
    name: "Jane Doe",
    email: "instructor@skillhub.com",
    passwordHash: "password123",
    role: "instructor",
    avatarId: "avatar-1",
    bio: "Passionate educator with 10+ years of experience in web development and design. My goal is to make complex topics easy and fun to learn.",
  },
  {
    id: "user-2",
    name: "John Smith",
    email: "student@skillhub.com",
    passwordHash: "password123",
    role: "student",
    avatarId: "avatar-2",
  },
  {
    id: "user-3",
    name: "Alex Ray",
    email: "student2@skillhub.com",
    passwordHash: "password123",
    role: "student",
    avatarId: "avatar-3",
  },
    {
    id: "user-4",
    name: "Emily White",
    email: "instructor2@skillhub.com",
    passwordHash: "password123",
    role: "instructor",
    avatarId: "avatar-4",
    bio: "Data scientist and AI enthusiast. I love breaking down machine learning concepts for beginners.",
  },
];

let courses: Course[] = [
  {
    id: "course-1",
    title: "The Complete Web Development Bootcamp",
    description:
      "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB and more!",
    category: "Web Development",
    instructorId: "user-1",
    price: 89.99,
    thumbnailId: "course-1",
    bannerId: "hero-1",
    requirements: ["A computer with internet access", "A text editor (e.g., VS Code)", "A willingness to learn"],
    whatYouWillLearn: [
      "Become a full-stack developer.",
      "Master frontend with React.",
      "Build backends with Node.js & Express.",
      "Learn to work with MongoDB and databases.",
    ],
    isPublished: true,
    sections: [
      {
        id: "sec-1-1",
        title: "Introduction",
        lectures: [{ id: "lec-1-1-1", title: "Welcome to the Course", type: "video", duration: 5, content: "..." }],
      },
      {
        id: "sec-1-2",
        title: "Frontend Basics",
        lectures: [{ id: "lec-1-2-1", title: "HTML Essentials", type: "video", duration: 45, content: "..." }],
      },
    ],
  },
  {
    id: "course-2",
    title: "Digital Photography for Beginners",
    description: "Learn the fundamentals of photography and how to use your camera.",
    category: "Photography",
    instructorId: "user-1",
    price: 49.99,
    thumbnailId: "course-2",
    isPublished: true,
    sections: [],
    whatYouWillLearn: [],
  },
  {
    id: "course-3",
    title: "Introduction to Python Programming",
    description: "A beginner-friendly introduction to the world of Python.",
    category: "Programming",
    instructorId: "user-4",
    price: 69.99,
    thumbnailId: "course-3",
    isPublished: true,
    sections: [],
    whatYouWillLearn: [],
  },
  {
    id: "course-4",
    title: "Advanced CSS and Sass",
    description: "Take your CSS skills to the next level with advanced techniques and Sass.",
    category: "Web Development",
    instructorId: "user-1",
    price: 59.99,
    thumbnailId: "course-4",
    isPublished: false, // Draft
    sections: [],
    whatYouWillLearn: [],
  },
   {
    id: "course-5",
    title: "Comprehensive Dummy Course for Testing",
    description: "A detailed course with various lecture types to test the learning page functionality.",
    category: "Testing",
    instructorId: "user-1",
    price: 19.99,
    thumbnailId: "course-5",
    bannerId: "hero-1",
    isPublished: true,
    whatYouWillLearn: ["Test video player", "Test quiz functionality", "Test note display", "Test navigation between lectures and sections"],
    requirements: ["Patience for dummy data"],
    sections: [
      {
        id: "sec-5-1",
        title: "Section 1: The Basics",
        lectures: [
          { id: "lec-5-1-1", title: "Video 1: Introduction", type: "video", duration: 8, content: "This is a description for the first video." },
          { id: "lec-5-1-2", title: "Video 2: Core Concepts", type: "video", duration: 15, content: "This video covers the core concepts." },
          { id: "lec-5-1-3", title: "Quiz 1: Check your knowledge", type: "quiz", duration: 10, content: JSON.stringify({
            questions: [
              { id: 'q1', text: 'What is the capital of France?', type: 'single-choice', options: [{text: 'Berlin', isCorrect: false}, {text: 'Paris', isCorrect: true}, {text: 'London', isCorrect: false}] },
              { id: 'q2', text: 'Which of these are primary colors?', type: 'multiple-choice', options: [{text: 'Red', isCorrect: true}, {text: 'Green', isCorrect: false}, {text: 'Blue', isCorrect: true}, {text: 'Yellow', isCorrect: true}] },
            ]
          })},
          { id: "lec-5-1-4", title: "Note 1: Summary of Basics", type: "note", duration: 5, content: "# Section 1 Summary\n\nThis section covered the fundamentals. Here are the key takeaways:\n\n- Point one\n- Point two\n- Point three" }
        ],
      },
      {
        id: "sec-5-2",
        title: "Section 2: Intermediate Concepts",
        lectures: [
          { id: "lec-5-2-1", title: "Video 3: Diving Deeper", type: "video", duration: 12, content: "Let's explore the intermediate topics." },
          { id: "lec-5-2-2", title: "Video 4: Practical Examples", type: "video", duration: 20, content: "Here are some practical, real-world examples." },
          { id: "lec-5-2-3", title: "Quiz 2: Intermediate Challenge", type: "quiz", duration: 15, content: JSON.stringify({
             questions: [
              { id: 'q3', text: 'What is 2 + 2?', type: 'single-choice', options: [{text: '3', isCorrect: false}, {text: '4', isCorrect: true}, {text: '5', isCorrect: false}] }
            ]
          })},
          { id: "lec-5-2-4", title: "Note 2: Intermediate Cheatsheet", type: "note", duration: 7, content: "## Cheatsheet\n\n- `code example()`\n- Another `important_function()`" }
        ],
      },
      {
        id: "sec-5-3",
        title: "Section 3: Advanced Topics",
        lectures: [
          { id: "lec-5-3-1", title: "Video 5: Expert Techniques", type: "video", duration: 18, content: "Unlock expert-level techniques in this video." },
          { id: "lec-5-3-2", title: "Video 6: Final Project Overview", type: "video", duration: 25, content: "An overview of the final project you will build." },
          { id: "lec-5-3-3", title: "Quiz 3: The Final Test", type: "quiz", duration: 20, content: JSON.stringify({
             questions: [
              { id: 'q4', text: 'This is the final question.', type: 'single-choice', options: [{text: 'Option A', isCorrect: false}, {text: 'Option B', isCorrect: false}, {text: 'Option C', isCorrect: true}] }
            ]
          })},
          { id: "lec-5-3-4", title: "Note 3: Further Reading", type: "note", duration: 3, content: "### Further Reading\n\nHere are some resources to continue your learning journey:\n\n1. [Resource One](https://example.com)\n2. [Resource Two](https://example.com)" }
        ],
      },
    ],
  },
];

let enrollments: Enrollment[] = [
  {
    id: "en-1",
    userId: "user-2",
    courseId: "course-1",
    progress: 75,
    completed: false,
    enrollmentDate: "2023-10-01T10:00:00Z",
  },
  {
    id: "en-2",
    userId: "user-2",
    courseId: "course-2",
    progress: 100,
    completed: true,
    enrollmentDate: "2023-09-15T10:00:00Z",
  },
  {
    id: "en-3",
    userId: "user-3",
    courseId: "course-1",
    progress: 20,
    completed: false,
    enrollmentDate: "2023-11-01T10:00:00Z",
  },
  {
    id: "en-4",
    userId: "user-2",
    courseId: "course-5",
    progress: 10,
    completed: false,
    enrollmentDate: "2024-01-01T10:00:00Z",
  },
];

let reviews: Review[] = [
  {
    id: "rev-1",
    userId: "user-2",
    courseId: "course-1",
    rating: 5,
    comment: "This course is amazing! I learned so much.",
    date: "2023-10-20T10:00:00Z",
  },
  {
    id: "rev-2",
    userId: "user-3",
    courseId: "course-1",
    rating: 4,
    comment: "Great content, but could be paced a bit better.",
    date: "2023-11-10T10:00:00Z",
  },
];

let certificates: Certificate[] = [
  { id: "cert-1", userId: "user-2", courseId: "course-2", issueDate: "2023-09-30T10:00:00Z" },
];

let wishlists: WishlistItem[] = [{ userId: "user-2", courseId: "course-3" }];

let carts: CartItem[] = [{ userId: "user-2", courseId: "course-4" }];

let quizAttempts: QuizAttempt[] = [
    { id: "qa-1", userId: "user-2", lectureId: "lec-5-1-3", score: 50, timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() }, // 36 hours ago
    { id: "qa-2", userId: "user-2", lectureId: "lec-5-1-3", score: 0, timestamp: new Date().toISOString() }, // recent
];


// API Functions
export const dataApi = {
  // User Functions
  getUserByEmail: (email: string) => users.find((u) => u.email === email),
  getUserById: (id: string) => users.find((u) => u.id === id),
  getUsers: () => users,
  getInstructors: () => users.filter(u => u.role === 'instructor'),
  createUser: (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    users.push(newUser);
    return newUser;
  },

  updateUserRole: (userId: string, role: 'student' | 'instructor') => {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = role;
        return user;
    }
    return null;
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      return users[userIndex];
    }
    return null;
  },


  // Course Functions
  getCourses: (filters?: { instructorId?: string; isPublished?: boolean }) => {
    let filteredCourses = courses;
    if (filters?.instructorId) {
      filteredCourses = filteredCourses.filter(c => c.instructorId === filters.instructorId);
    }
    if (filters?.isPublished !== undefined) {
      filteredCourses = filteredCourses.filter(c => c.isPublished === filters.isPublished);
    }
    return filteredCourses;
  },
  getCourseById: (id: string) => courses.find((c) => c.id === id),
  createCourse: (course: Omit<Course, 'id'>) => {
    const newCourse = { ...course, id: `course-${Date.now()}` };
    courses.push(newCourse);
    return newCourse;
  },
  updateCourse: (courseId: string, updates: Partial<Course>) => {
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex > -1) {
      courses[courseIndex] = { ...courses[courseIndex], ...updates };
      return courses[courseIndex];
    }
    return null;
  },
  searchCourses: (query: string) => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();
    return courses.filter(course =>
      course.isPublished && (
        course.title.toLowerCase().includes(lowerCaseQuery) ||
        course.description.toLowerCase().includes(lowerCaseQuery)
      )
    );
  },
  
  // Enrollment Functions
  isUserEnrolled: (userId: string, courseId: string) => enrollments.some(e => e.userId === userId && e.courseId === courseId),
  enrollUser: (userId: string, courseId: string) => {
    if (dataApi.isUserEnrolled(userId, courseId)) return;
    const newEnrollment: Enrollment = {
      id: `en-${Date.now()}`,
      userId,
      courseId,
      progress: 0,
      completed: false,
      enrollmentDate: new Date().toISOString(),
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
  },
  getEnrollmentsByUserId: (userId: string) => enrollments.filter(e => e.userId === userId),
  getEnrollmentsByCourseId: (courseId: string) => enrollments.filter(e => e.courseId === courseId),
  getTotalStudentsForInstructor: (instructorId: string) => {
    const instructorCourses = courses.filter(c => c.instructorId === instructorId).map(c => c.id);
    const studentIds = new Set(enrollments.filter(e => instructorCourses.includes(e.courseId)).map(e => e.userId));
    return studentIds.size;
  },
  
  // Review functions
  getReviewsByCourseId: (courseId: string) => reviews.filter(r => r.courseId === courseId),
  getOverallRatingForInstructor: (instructorId: string) => {
    const instructorCourses = courses.filter(c => c.instructorId === instructorId).map(c => c.id);
    const allReviews = reviews.filter(r => instructorCourses.includes(r.courseId));
    if (allReviews.length === 0) return 0;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    return totalRating / allReviews.length;
  },

  // Quiz Attempt Functions
  getQuizAttempts: (userId: string, lectureId: string) => {
    return quizAttempts.filter(qa => qa.userId === userId && qa.lectureId === lectureId);
  },
  addQuizAttempt: (userId: string, lectureId: string, score: number) => {
    const newAttempt: QuizAttempt = {
        id: `qa-${Date.now()}`,
        userId,
        lectureId,
        score,
        timestamp: new Date().toISOString(),
    };
    quizAttempts.push(newAttempt);
    return newAttempt;
  },

  // Wishlist Functions
  getWishlistItems: (userId: string) => wishlists.filter(w => w.userId === userId),
  isCourseInWishlist: (userId: string, courseId: string) => wishlists.some(w => w.userId === userId && w.courseId === courseId),
  addToWishlist: (userId: string, courseId: string) => {
    if (!dataApi.isCourseInWishlist(userId, courseId)) {
        wishlists.push({ userId, courseId });
    }
  },
  removeFromWishlist: (userId: string, courseId: string) => {
    wishlists = wishlists.filter(w => w.userId !== userId || w.courseId !== courseId);
  },

  // Cart Functions
  getCartItems: (userId: string) => carts.filter(c => c.userId === userId),
  isCourseInCart: (userId: string, courseId: string) => carts.some(c => c.userId === userId && c.courseId === courseId),
  addToCart: (userId: string, courseId: string) => {
    if (!dataApi.isCourseInCart(userId, courseId)) {
      carts.push({ userId, courseId });
    }
  },
  removeFromCart: (userId: string, courseId: string) => {
    carts = carts.filter(c => c.userId !== userId || c.courseId !== courseId);
  },
  clearCart: (userId: string) => {
    carts = carts.filter(c => c.userId !== userId);
  },
  
  // Checkout
  checkout: (userId: string) => {
    const userCart = dataApi.getCartItems(userId);
    userCart.forEach(item => {
      dataApi.enrollUser(userId, item.courseId);
    });
    dataApi.clearCart(userId);
    return userCart.map(item => item.courseId);
  },
  
  // Certificate Functions
  getCertificatesByUserId: (userId: string) => {
    return certificates.filter(c => c.userId === userId);
  },

  // Analytics functions
  getStudentProgressForCourse: (courseId: string) => {
    return enrollments
      .filter(e => e.courseId === courseId)
      .map(e => {
        const student = dataApi.getUserById(e.userId);
        return {
          studentName: student?.name || 'Unknown',
          studentId: e.userId,
          progress: e.progress,
          enrollmentDate: e.enrollmentDate,
        }
      });
  },

  getRecentActivityForInstructor: (instructorId: string) => {
    const instructorCourses = courses.filter(c => c.instructorId === instructorId).map(c => c.id);
    const recentEnrollments = enrollments.filter(e => instructorCourses.includes(e.courseId)).slice(-3).map(e => ({ type: 'enrollment', courseId: e.courseId, userId: e.userId, date: e.enrollmentDate}));
    const recentReviews = reviews.filter(r => instructorCourses.includes(r.courseId)).slice(-2).map(r => ({ type: 'review', courseId: r.courseId, userId: r.userId, date: r.date, rating: r.rating}));
    
    return [...recentEnrollments, ...recentReviews].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

};

    