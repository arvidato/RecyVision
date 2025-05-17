interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface ScanHistory {
  date: string;
  items: string[];
  points: number;
}

interface ItemCount {
  item: string;
  count: number;
}

class AchievementsService {
  private achievements: Achievement[] = [
    {
      id: 'first_scan',
      title: 'First Scan',
      description: 'Complete your first recycling scan',
      icon: '📸',
      unlocked: false,
      progress: 0,
      total: 1
    },
    {
      id: 'scan_streak_3',
      title: '3-Day Streak',
      description: 'Scan items for 3 consecutive days',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      total: 3
    },
    {
      id: 'scan_streak_7',
      title: '7-Day Streak',
      description: 'Scan items for 7 consecutive days',
      icon: '🌟',
      unlocked: false,
      progress: 0,
      total: 7
    },
    {
      id: 'points_100',
      title: 'Points Collector',
      description: 'Earn 100 points from recycling',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      total: 100
    },
    {
      id: 'points_500',
      title: 'Recycling Master',
      description: 'Earn 500 points from recycling',
      icon: '👑',
      unlocked: false,
      progress: 0,
      total: 500
    }
  ];

  private scanHistory: ScanHistory[] = [];
  private itemCounts: ItemCount[] = [];

  async getAchievements(): Promise<Achievement[]> {
    // In a real app, this would fetch from a backend
    return this.achievements;
  }

  async getScanHistory(): Promise<ScanHistory[]> {
    // In a real app, this would fetch from a backend
    return this.scanHistory;
  }

  async getItemCounts(): Promise<ItemCount[]> {
    // In a real app, this would fetch from a backend
    return this.itemCounts;
  }

  async addScanHistory(scan: ScanHistory): Promise<void> {
    this.scanHistory.push(scan);
    // Update item counts
    scan.items.forEach(item => {
      const existingCount = this.itemCounts.find(ic => ic.item === item);
      if (existingCount) {
        existingCount.count++;
      } else {
        this.itemCounts.push({ item, count: 1 });
      }
    });
  }

  async updateAchievementProgress(achievementId: string, progress: number): Promise<void> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement) {
      achievement.progress = progress;
      if (progress >= achievement.total) {
        achievement.unlocked = true;
      }
    }
  }

  async checkAndUpdateAchievements(
    scanCount: number,
    streakDays: number,
    totalPoints: number
  ): Promise<Achievement[]> {
    // Update scan-related achievements
    await this.updateAchievementProgress('first_scan', scanCount);
    await this.updateAchievementProgress('scan_streak_3', streakDays);
    await this.updateAchievementProgress('scan_streak_7', streakDays);

    // Update points-related achievements
    await this.updateAchievementProgress('points_100', totalPoints);
    await this.updateAchievementProgress('points_500', totalPoints);

    return this.achievements;
  }
}

export const achievementsService = new AchievementsService(); 