export interface WatchEntry {
  id: string;
  title: string;
  channelName: string;
  channelUrl?: string;
  timestamp: string;
  date: Date;
}

export interface BingeSession {
  startDate: Date;
  endDate: Date;
  durationMs: number;
  videoCount: number;
  channels: Set<string>;
}

export interface AnalyticsData {
  entries: WatchEntry[];
  totalVideos: number;
  uniqueChannels: number;
  dateRange: { start: Date; end: Date };
  totalDays: number;
  activeDays: number;
  inactiveDays: number;
  longestStreak: number;
  currentStreak: number;
  avgVideosPerActiveDay: number;
  topChannels: { channel: string; count: number; percentage: number }[];
  activityByHour: { hour: string; count: number }[];
  activityByDay: { day: string; count: number }[];
  activityByMonth: { month: string; count: number }[];
  activityByYear: { year: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  bingeSessions: BingeSession[];
  longestBinge: BingeSession | null;
  personalities: string[];
  mostActiveDayEver: { date: Date; count: number } | null;
  leastActiveDayEver: { date: Date; count: number } | null;
  earliestMorningWatch: WatchEntry | null;
  latestNightWatch: WatchEntry | null;
  timeSlotPercentages: { slot: string; percentage: number }[];
  estimatedTotalHours: number;
  estimatedTotalDays: number;
  peakHour: number;
  peakDay: string;
  peakMonth: string;
}
