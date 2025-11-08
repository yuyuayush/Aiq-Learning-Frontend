/**
 * Utility functions for course and certificate management
 */

/**
 * Calculate if all lectures in a course are completed
 * @param course - The course object with sections and lectures
 * @param progress - The progress object with completed lessons
 * @returns boolean indicating if all lectures are completed
 */
export const isCourseCompleted = (course: any, progress: any): boolean => {
  if (!course || !course.sections || !progress) {
    return false;
  }

  // Count total lectures in course
  let totalLectures = 0;
  course.sections.forEach((section: any) => {
    if (section.lectures && Array.isArray(section.lectures)) {
      totalLectures += section.lectures.length;
    }
  });

  // Count completed lectures
  const completedLectures = progress.completedLessons?.length || 0;

  // Check if all lectures are completed
  return totalLectures > 0 && completedLectures >= totalLectures;
};

/**
 * Calculate the overall progress percentage of a course
 * @param course - The course object with sections and lectures
 * @param progress - The progress object with completed lessons
 * @returns number indicating progress percentage (0-100)
 */
export const calculateCourseProgress = (course: any, progress: any): number => {
  if (!course || !course.sections || !progress) {
    return 0;
  }

  // Count total lectures in course
  let totalLectures = 0;
  course.sections.forEach((section: any) => {
    if (section.lectures && Array.isArray(section.lectures)) {
      totalLectures += section.lectures.length;
    }
  });

  if (totalLectures === 0) {
    return 0;
  }

  // Count completed lectures
  const completedLectures = progress.completedLessons?.length || 0;

  // Calculate percentage
  return Math.round((completedLectures / totalLectures) * 100);
};

/**
 * Get the next incomplete lecture in a course
 * @param course - The course object with sections and lectures
 * @param progress - The progress object with completed lessons
 * @returns object with sectionIndex and lectureIndex of next incomplete lecture, or null if all complete
 */
export const getNextIncompleteLecture = (course: any, progress: any): { sectionIndex: number; lectureIndex: number } | null => {
  if (!course || !course.sections) {
    return null;
  }

  for (let sectionIndex = 0; sectionIndex < course.sections.length; sectionIndex++) {
    const section = course.sections[sectionIndex];
    if (section.lectures && Array.isArray(section.lectures)) {
      for (let lectureIndex = 0; lectureIndex < section.lectures.length; lectureIndex++) {
        // Check if this lecture is completed
        const isCompleted = progress?.completedLessons?.some(
          (lesson: any) => lesson.sectionIndex === sectionIndex && lesson.lessonIndex === lectureIndex
        );

        if (!isCompleted) {
          return { sectionIndex, lectureIndex };
        }
      }
    }
  }

  return null; // All lectures completed
};

/**
 * Format certificate ID for display
 * @param certificateId - The certificate ID string
 * @returns formatted certificate ID
 */
export const formatCertificateId = (certificateId: string): string => {
  if (!certificateId || typeof certificateId !== 'string') {
    return 'N/A';
  }

  // Format as XXXX-XXXX-XXXX pattern if it's a long string
  if (certificateId.length > 12) {
    return certificateId.toUpperCase().replace(/(.{4})(?=.)/g, '$1-');
  }

  return certificateId.toUpperCase();
};

/**
 * Generate a unique certificate ID
 * @param userId - The user ID
 * @param courseId - The course ID
 * @returns a unique certificate ID string
 */
export const generateCertificateId = (userId: string, courseId: string): string => {
  const timestamp = Date.now().toString(36);
  const userHash = userId.slice(-4);
  const courseHash = courseId.slice(-4);
  
  return `CERT-${timestamp}-${userHash}-${courseHash}`.toUpperCase();
};