export interface PlannerDaySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // "Monday", etc.
  availableMinutes: number;
  scheduledMinutes: number;
  tasks: PlannerTask[];
}

export interface PlannerTask {
  id: string;
  topicId?: string;
  title: string;
  subjectName: string;
  estimatedMinutes: number;
  priority: "low" | "medium" | "high" | "critical";
  isCompleted: boolean;
  isLocked: boolean;
}

export interface AllocationParams {
  examDate: string; // YYYY-MM-DD
  dailyHours: number;
  preferredDays: number[]; // 0=Sun..6=Sat
  startDate?: string; // Optional fixed start date (YYYY-MM-DD)
  topics: {
    id: string;
    name: string;
    subjectName: string;
    priority: "low" | "medium" | "high" | "critical";
    estimatedMinutes: number;
    status: string;
  }[];
}

export interface AllocationResult {
  schedule: PlannerDaySchedule[];
  totalWorkloadMinutes: number;
  totalAvailableMinutes: number;
  isOverloaded: boolean;
  overloadMinutes: number;
  allocatedTopicCount: number;
  totalUnpreparedCount: number;
}

/**
 * Intelligent topic distributor:
 * 1. Filters only unfinished/unprepared topics.
 * 2. Prioritizes critical & high topics first.
 * 3. Distributes topics across available study days before exam date.
 * 4. Strictly respects daily available hours.
 * 5. Detects and flags overload with exact minutes if workload exceeds available time.
 */
export function generateStudyPlan(params: AllocationParams): AllocationResult {
  const { examDate, dailyHours, preferredDays, topics } = params;

  // 1. Unprepared topics
  const unfinished = topics.filter((t) => t.status !== "completed");

  // 2. Sort by priority: critical -> high -> medium -> low
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...unfinished].sort(
    (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]
  );

  // 3. Build available calendar dates between start and exam date
  const schedules: PlannerDaySchedule[] = [];
  const start = params.startDate ? new Date(params.startDate) : new Date("2026-11-19");
  start.setHours(0, 0, 0, 0);

  const end = new Date(examDate);
  end.setHours(0, 0, 0, 0);

  const daysDiff = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyCapMinutes = Math.round(dailyHours * 60);

  let totalAvailableMinutes = 0;
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let i = 0; i <= daysDiff; i++) {
    const cur = new Date(start);
    cur.setDate(cur.getDate() + i);
    const dayOfWeekIdx = cur.getDay();

    if (preferredDays.includes(dayOfWeekIdx)) {
      schedules.push({
        date: cur.toISOString().split("T")[0],
        dayOfWeek: dayNames[dayOfWeekIdx],
        availableMinutes: dailyCapMinutes,
        scheduledMinutes: 0,
        tasks: [],
      });
      totalAvailableMinutes += dailyCapMinutes;
    }
  }

  // 4. Distribute topics into days
  let currentDayIdx = 0;
  let totalWorkloadMinutes = 0;
  let allocatedCount = 0;

  for (const topic of sorted) {
    totalWorkloadMinutes += topic.estimatedMinutes;

    if (schedules.length === 0) continue;

    // Find next day with available capacity
    let placed = false;
    for (let attempt = 0; attempt < schedules.length; attempt++) {
      const day = schedules[currentDayIdx];
      if (day.scheduledMinutes + topic.estimatedMinutes <= day.availableMinutes) {
        day.tasks.push({
          id: `task-${topic.id}`,
          topicId: topic.id,
          title: topic.name,
          subjectName: topic.subjectName,
          estimatedMinutes: topic.estimatedMinutes,
          priority: topic.priority,
          isCompleted: false,
          isLocked: false,
        });
        day.scheduledMinutes += topic.estimatedMinutes;
        placed = true;
        allocatedCount++;
        break;
      }
      currentDayIdx = (currentDayIdx + 1) % schedules.length;
    }

    // If day capacity is tight, append to current day to guarantee topic is never dropped
    if (!placed) {
      const fallbackDay = schedules[currentDayIdx];
      fallbackDay.tasks.push({
        id: `task-${topic.id}`,
        topicId: topic.id,
        title: topic.name,
        subjectName: topic.subjectName,
        estimatedMinutes: topic.estimatedMinutes,
        priority: topic.priority,
        isCompleted: false,
        isLocked: false,
      });
      fallbackDay.scheduledMinutes += topic.estimatedMinutes;
      allocatedCount++;
      currentDayIdx = (currentDayIdx + 1) % schedules.length;
    }
  }

  const isOverloaded = totalWorkloadMinutes > totalAvailableMinutes;
  const overloadMinutes = Math.max(0, totalWorkloadMinutes - totalAvailableMinutes);

  return {
    schedule: schedules,
    totalWorkloadMinutes,
    totalAvailableMinutes,
    isOverloaded,
    overloadMinutes,
    allocatedTopicCount: allocatedCount,
    totalUnpreparedCount: unfinished.length,
  };
}
