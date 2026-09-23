// Simplified Dashboard Types - avoiding complex import dependencies

// Basic types for dashboard functionality
export interface IStudentStats {
  totalCourses: number;
  activeCourses: number;
  totalCoins: number;
  codingStreak: number;
  timeSpent: number;
  averageProgress: number;
}

export interface IParentStats {
  totalChildren: number;
  activeChildren: number;
  totalTimeSpent: number;
  averageProgress: number;
  totalCoinsEarned: number;
}

export interface IStudentDashboardProps {
  courses: any[]; // Using any to avoid import issues
  stats: IStudentStats;
  selectedTab?: "overview" | "courses" | "children";
}

export interface IParentDashboardProps {
  parent: any; // Using any to avoid import issues
  children: any[]; // Using any to avoid import issues
  stats: IParentStats;
}

export type UserType = "student" | "parent";

export interface IDashboardProps {
  userType: UserType;
  user: any; // Using any to avoid import issues
  courses: any[]; // Using any to avoid import issues
  children?: any[]; // Using any to avoid import issues
  stats: IStudentStats | IParentStats;
}

// Progress types
export interface IProgress {
  _id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  slideId?: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  completedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IStudentProgress {
  _id: string;
  studentId: string;
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  totalTimeSpent: number;
  lastActivity: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IProgressResponse {
  progress: IProgress;
  percentage: number;
  totalLessons: number;
  completedLessons: number;
}

export interface IChildProgressSummary {
  childLearnerId?: string;
  child: any;
  courses: Array<{
    course: any;
    progress: {
      percentage: number;
      completedLessons: number;
      totalLessons: number;
      completedSlides?: number;
      totalSlides?: number;
      coinsEarned?: number;
    };
  }>;
}

// Lesson Types
export enum LessonDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export interface ILesson {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  slides: string[];
  difficulty: LessonDifficulty;
  duration: number;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateLessonDto {
  title: string;
  description?: string;
  courseId: string;
  slides?: string[];
  difficulty?: LessonDifficulty;
  duration: number;
  tags?: string[];
}

export type IUpdateLessonDto = Partial<ICreateLessonDto>;

export interface IAddSlideDto {
  slideId: string;
}

export interface IReorderLessonsDto {
  lessonIds: string[];
}

// Course Rating Types
export enum RatingValue {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export interface ICourseRating {
  courseId: string;
  userId: string;
  rating: RatingValue;
  review?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICreateCourseRatingDto {
  rating: RatingValue;
  review?: string;
}

export type IUpdateCourseRatingDto = Partial<ICreateCourseRatingDto>;

export interface ICourseRatingResponse {
  id: string;
  courseId: string;
  userId: string;
  rating: RatingValue;
  review?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ICourseRatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
  userRating?: RatingValue;
  userReview?: string;
}
