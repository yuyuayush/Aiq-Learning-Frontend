// API service layer for connecting frontend to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
    message?: string;
    token?: string;
    user?: any;
    data?: T;
    [key: string]: any;
}

class ApiError extends Error {
    status: number;
    data: any;
    
    constructor(message: string, status: number, data: any = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Token management
const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('aiq-token');
    }
    return null;
};

const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('aiq-token', token);
    }
};

const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('aiq-token');
    }
};

// Base API request function
const apiRequest = async <T = any>(endpoint: string, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add authentication header if token exists
    if (token) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            // Handle 401 Unauthorized specifically
            if (response.status === 401) {
                // Token might be expired, remove it
                removeToken();
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('aiq-user');
                }
            }
            
            throw new ApiError(
                data?.message || `HTTP error! status: ${response.status}`,
                response.status,
                data
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError('Network error occurred', 0);
    }
};

// Auth API
export const authApi = {
    // Login
    async login(email: string, password: string): Promise<ApiResponse> {
        const data = await apiRequest<ApiResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.token) {
            setToken(data.token);
        }

        return data;
    },

    // Register
    async register(name: string, email: string, password: string, role: 'learner' | 'instructor' = 'learner'): Promise<ApiResponse> {
        const data = await apiRequest<ApiResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        });

        if (data.token) {
            setToken(data.token);
        }

        return data;
    },

    // Get current user profile
    async getProfile(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/auth/profile');
    },

    // Update profile
    async updateProfile(profileData: Record<string, any>): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    // Update instructor profile
    async updateInstructorProfile(instructorData: Record<string, any>): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/auth/instructor-profile', {
            method: 'PUT',
            body: JSON.stringify(instructorData),
        });
    },

    // Logout
    logout(): void {
        removeToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('aiq-user');
        }
    },
};

// Courses API
export const coursesApi = {
    // Get all published courses (for students to browse)
    async getPublished(params: Record<string, any> = {}): Promise<ApiResponse> {
        const queryParams = new URLSearchParams();
        
        // Convert params to URLSearchParams
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                queryParams.append(key, params[key].toString());
            }
        });
        
        return await apiRequest<ApiResponse>(`/courses?${queryParams}`);
    },

    // Get instructor dashboard stats
    async getDashboardStats(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/courses/instructor/dashboard-stats');
    },

    // Get instructor's courses
    async getMyCourses(params: Record<string, string> = {}): Promise<ApiResponse> {
        const queryParams = new URLSearchParams(params);
        return await apiRequest<ApiResponse>(`/courses/instructor/my-courses?${queryParams}`);
    },

    // Create draft course
    async createDraft(formData: FormData): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/courses/draft', {
            method: 'POST',
            headers: {},
            body: formData, // FormData for file uploads
        });
    },

    // Update course basic info
    async updateBasicInfo(courseId: string, formData: FormData): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/basic-info`, {
            method: 'PUT',
            headers: {},
            body: formData, // FormData for file uploads
        });
    },

    // Get course details
    async getCourse(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}`);
    },

    // Get course by ID (alias for getCourse)
    async getById(courseId: string): Promise<ApiResponse> {
        return await this.getCourse(courseId);
    },

    // Update course
    async update(courseId: string, formData: FormData): Promise<ApiResponse> {
        return await this.updateBasicInfo(courseId, formData);
    },

    // Add section to course
    async addSection(courseId: string, sectionData: Record<string, any>): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/sections`, {
            method: 'POST',
            body: JSON.stringify(sectionData),
        });
    },

    // Add lecture to section
    async addLecture(courseId: string, sectionId: string, lectureData: Record<string, any>): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/sections/${sectionId}/lectures`, {
            method: 'POST',
            body: JSON.stringify(lectureData),
        });
    },

    // Update lecture
    async updateLecture(courseId: string, sectionId: string, lectureId: string, lectureData: Record<string, any>): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, {
            method: 'PUT',
            body: JSON.stringify(lectureData),
        });
    },

    // Publish/unpublish course
    async togglePublish(courseId: string, publish: boolean = true): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/publish`, {
            method: 'PATCH',
            body: JSON.stringify({ publish }),
        });
    },

    // Delete course
    async deleteCourse(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}`, {
            method: 'DELETE',
        });
    },

    // Delete lecture (immediately from MongoDB + api.video)
    async deleteLecture(courseId: string, sectionId: string, lectureId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, {
            method: 'DELETE',
        });
    },

    // Test SSE connection
    testSSE(): Promise<boolean> {
        return new Promise((resolve) => {
            console.log('🧪 Testing SSE connection...');
            const sseUrl = `${API_BASE_URL}/courses/test-sse`;
            const eventSource = new EventSource(sseUrl);
            let messageCount = 0;

            eventSource.onopen = () => {
                console.log('✅ SSE test connection opened successfully');
            };

            eventSource.onmessage = (event) => {
                console.log('📩 SSE test message received:', event.data);
                messageCount++;
                
                try {
                    const data = JSON.parse(event.data);
                    if (data.complete) {
                        console.log('✅ SSE test completed successfully, received', messageCount, 'messages');
                        eventSource.close();
                        resolve(true);
                    }
                } catch (error) {
                    console.error('❌ SSE test message parse error:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('❌ SSE test connection error:', error);
                eventSource.close();
                resolve(false);
            };

            // Timeout after 10 seconds
            setTimeout(() => {
                console.warn('⏱️ SSE test timeout');
                eventSource.close();
                resolve(false);
            }, 10000);
        });
    },

    // Test CORS connectivity to backend
    async testCORS(): Promise<ApiResponse> {
        try {
            console.log('🧪 Testing CORS connectivity to:', `${API_BASE_URL}/courses/cors-test`);
            const response = await fetch(`${API_BASE_URL}/courses/cors-test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            console.log('✅ CORS Test Response:', data);
            return data;
        } catch (error) {
            console.error('❌ CORS Test Failed:', error);
            throw error;
        }
    },

    // Simple video upload to api.video with progress tracking
    async uploadVideo(
        courseId: string,
        sectionIndex: number,
        lectureIndex: number,
        videoFile: File,
        thumbnailFile?: File,
        onProgress?: (progress: number) => void
    ): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('video', videoFile);
        formData.append('courseId', courseId);
        formData.append('sectionIndex', sectionIndex.toString());
        formData.append('lectureIndex', lectureIndex.toString());
        
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const token = getToken();
        
        // Hybrid progress tracking: Try SSE first, fall back to polling
        // Simple milestone-based progress tracking
        const progressKey = `${courseId}-${sectionIndex}-${lectureIndex}`;
        let progressMilestones = [20, 40, 60, 80, 90, 100];
        let currentMilestoneIndex = 0;
        
        // Start progress tracking by periodically checking backend
        let progressCheckInterval: NodeJS.Timeout | null = null;
        let progressCompleted = false;
        
        if (onProgress) {
            console.log('📹 Starting milestone-based progress tracking...');
            onProgress(0); // Start at 0%
            
            progressCheckInterval = setInterval(async () => {
                if (progressCompleted) {
                    clearInterval(progressCheckInterval!);
                    return;
                }
                
                try {
                    const response = await fetch(`${API_BASE_URL}/courses/progress-milestone/${progressKey}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.milestone && data.milestone > (progressMilestones[currentMilestoneIndex - 1] || 0)) {
                            console.log('📹 Progress milestone reached:', data.milestone + '%');
                            onProgress(data.milestone);
                            
                            if (data.milestone >= 100) {
                                progressCompleted = true;
                                clearInterval(progressCheckInterval!);
                            }
                        }
                    }
                } catch (error) {
                    console.warn('📹 Progress milestone check failed:', error);
                }
            }, 1000); // Check every second for milestone updates
        }
        
        try {
            console.log('📹 Starting video upload...');
            const response = await fetch(`${API_BASE_URL}/courses/upload-video`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new ApiError(data.message || 'Upload failed', response.status, data);
            }

            // Clean up progress tracking and ensure 100%
            progressCompleted = true;
            if (progressCheckInterval) {
                clearInterval(progressCheckInterval);
            }
            if (onProgress) {
                console.log('📹 Upload completed - setting progress to 100%');
                onProgress(100);
            }

            return data;
        } catch (error) {
            // Clean up progress tracking on error
            progressCompleted = true;
            if (progressCheckInterval) {
                clearInterval(progressCheckInterval);
            }
            
            if (error instanceof ApiError) {
                throw error;
            }
            
            throw new ApiError('Network error during upload', 0, null);
        }
    },

    // Upload video for lecture (legacy - complex route)
    async uploadLectureVideo(
        courseId: string, 
        sectionId: string, 
        lectureId: string, 
        videoFile: File, 
        thumbnailFile?: File
    ): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('video', videoFile);
        
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        const token = getToken();
        return await fetch(`${API_BASE_URL}/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/upload-video`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        }).then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
                throw new ApiError(data.message || 'Upload failed', response.status, data);
            }
            return data;
        });
    },
};

// Categories API
export const categoriesApi = {
    async getAll(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/categories');
    },
};

// Student/Learner API
export const studentApi = {
    // Get student's enrollments
    async getMyEnrollments(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/enrollments/my-enrollments');
    },

    // Get student's enrolled courses with progress
    async getMyCourses(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/enrollments/my-courses');
    },

    // Enroll in a course
    async enrollInCourse(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/enrollments/enroll/${courseId}`, {
            method: 'POST'
        });
    },

    // Get course progress
    async getCourseProgress(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/progress/course/${courseId}`);
    },

    // Mark lesson as complete
    async markLessonComplete(courseId: string, sectionId: string, lectureId: string, timeSpent?: number): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/progress/lesson-complete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseId,
                sectionId,
                lectureId,
                timeSpent: timeSpent || 0
            })
        });
    },

    // Unmark lesson as complete
    async unmarkLessonComplete(courseId: string, sectionId: string, lectureId: string, timeSpent?: number): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/progress/lesson-uncomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseId,
                sectionId,
                lectureId,
                timeSpent: timeSpent || 0
            })
        });
    },

    // Get student dashboard overview
    async getDashboardOverview(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/progress/overview');
    },

    // Get specific enrollment details
    async getEnrollmentDetails(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/enrollments/my-enrollment/${courseId}`);
    },
};

// Certificate API
export const certificateApi = {
    // Get user's certificates
    async getCertificates(): Promise<ApiResponse> {
        try {
            return await apiRequest<ApiResponse>('/certificates');
        } catch (error: any) {
            // Handle various certificate API unavailability scenarios
            console.warn('Certificate list error:', error.status, error.message);
            
            // For any certificate API error, just return empty list
            // This prevents dashboard loading issues
            return {
                success: true,
                certificates: [],
                serviceUnavailable: error.status === 403 || error.message?.includes('Insufficient permissions') || error.message?.includes('Forbidden')
            };
        }
    },

    // Get certificate by course ID
    async getCertificateByCourse(courseId: string): Promise<ApiResponse> {
        try {
            return await apiRequest<ApiResponse>(`/certificates/course/${courseId}`);
        } catch (error: any) {
            // Handle various certificate API unavailability scenarios
            console.warn('Certificate API error:', error.status, error.message);
            
            if (error.status === 404) {
                return {
                    success: false,
                    message: 'Certificate not found',
                    certificate: null
                };
            } else if (error.status === 403 || error.message?.includes('Insufficient permissions') || error.message?.includes('Forbidden')) {
                return {
                    success: false,
                    message: 'Certificate access denied',
                    certificate: null,
                    serviceUnavailable: true
                };
            } else if (error.status === 0 || error.status === 500) {
                return {
                    success: false,
                    message: 'Certificate service unavailable',
                    certificate: null,
                    serviceUnavailable: true
                };
            }
            
            // For any other error, return a generic unavailable response
            return {
                success: false,
                message: 'Certificate temporarily unavailable',
                certificate: null,
                serviceUnavailable: true
            };
        }
    },

    // Generate certificate for completed course
    async generateCertificate(courseId: string): Promise<ApiResponse> {
        try {
            return await apiRequest<ApiResponse>(`/certificates/generate/${courseId}`, {
                method: 'POST'
            });
        } catch (error: any) {
            // Handle various certificate API unavailability scenarios
            console.warn('Certificate generation error:', error.status, error.message);
            
            if (error.status === 404) {
                return {
                    success: false,
                    message: 'Certificate generation not available',
                    certificate: null,
                    serviceUnavailable: true
                };
            } else if (error.status === 403 || error.message?.includes('Insufficient permissions') || error.message?.includes('Forbidden')) {
                return {
                    success: false,
                    message: 'Certificate generation access denied',
                    certificate: null,
                    serviceUnavailable: true
                };
            } else if (error.status === 0 || error.status === 500) {
                return {
                    success: false,
                    message: 'Certificate service unavailable',
                    certificate: null,
                    serviceUnavailable: true
                };
            }
            
            // For any other error, return a generic unavailable response
            return {
                success: false,
                message: 'Certificate generation temporarily unavailable',
                certificate: null,
                serviceUnavailable: true
            };
        }
    },

    // Get certificate by ID
    async getCertificate(certificateId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/certificates/${certificateId}`);
    },

    // Download certificate
    async downloadCertificate(certificateId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/certificates/${certificateId}/download`);
    },

    // Get certificate image with custom text overlays
    async getCertificateImage(certificateId: string): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}/image`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
            },
        });
        
        if (!response.ok) {
            throw new ApiError('Failed to fetch certificate image', response.status);
        }
        
        return await response.blob();
    },
};

// Video API
export const videoApi = {
    // Get video details from api.video
    async getVideoDetails(videoId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/videos/${videoId}`);
    },
};

// Cart API
export const cartApi = {
    // Get user's cart
    async getCart(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/cart');
    },

    // Add course to cart
    async addToCart(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/cart/${courseId}`, {
            method: 'POST'
        });
    },

    // Remove course from cart
    async removeFromCart(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/cart/${courseId}`, {
            method: 'DELETE'
        });
    },

    // Check if course is in cart
    async checkInCart(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/cart/check/${courseId}`);
    },

    // Clear entire cart
    async clearCart(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/cart', {
            method: 'DELETE'
        });
    },
};

// Wishlist API
export const wishlistApi = {
    // Get user's wishlist
    async getWishlist(): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>('/wishlist');
    },

    // Add course to wishlist
    async addToWishlist(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/wishlist/${courseId}`, {
            method: 'POST'
        });
    },

    // Remove course from wishlist
    async removeFromWishlist(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/wishlist/${courseId}`, {
            method: 'DELETE'
        });
    },

    // Check if course is in wishlist
    async checkInWishlist(courseId: string): Promise<ApiResponse> {
        return await apiRequest<ApiResponse>(`/wishlist/check/${courseId}`);
    },
};

// Export helper functions
export { ApiError, getToken, setToken, removeToken };