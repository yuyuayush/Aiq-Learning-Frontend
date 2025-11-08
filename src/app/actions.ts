"use server";

import { getStudentEngagementInsights } from "@/ai/flows/student-engagement-insights";
import { dataApi } from "@/lib/data";

export async function getAIInsightsAction(courseId: string) {
  try {
    const course = dataApi.getCourseById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const studentProgress = dataApi.getStudentProgressForCourse(courseId);

    const input = {
      courseRoster: JSON.stringify(
        studentProgress.map(s => ({ id: s.studentId, name: s.studentName }))
      ),
      progressSnapshots: JSON.stringify(
        studentProgress.map(s => ({
          student: s.studentName,
          progress: `${s.progress}%`,
        }))
      ),
      engagementData: "Forum participation is high on week 1, but drops off significantly by week 3. Most questions are about setting up the development environment.",
    };

    const insights = await getStudentEngagementInsights(input);
    return { success: true, data: insights };
  } catch (error) {
    console.error("Error getting AI insights:", error);
    return { success: false, error: (error as Error).message };
  }
}
