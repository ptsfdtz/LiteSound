/**
 * 格式化时间（秒转为 mm:ss 格式）
 * @param seconds 秒数
 * @returns 格式化后的时间字符串
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 解析时间字符串（mm:ss 格式转为秒数）
 * @param timeString 时间字符串
 * @returns 秒数
 */
export function parseTime(timeString: string): number {
  const [mins, secs] = timeString.split(':').map(Number);
  return mins * 60 + secs;
}

/**
 * 根据进度百分比和总时长计算当前播放时间
 * @param progress 进度百分比 (0-100)
 * @param durationString 总时长字符串 (mm:ss格式)
 * @returns 格式化后的当前时间字符串
 */
export function calculateCurrentTime(progress: number, durationString: string): string {
  const totalSeconds = parseTime(durationString);
  const currentSeconds = Math.round((progress / 100) * totalSeconds);
  return formatTime(currentSeconds);
}

/**
 * 类名合并工具
 * @param classes 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
