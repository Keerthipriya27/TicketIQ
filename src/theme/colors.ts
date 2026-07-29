export const colors = {
  primary: '#6C63FF',
  primaryLight: '#E8E7FF',
  secondary: '#8B5CF6',
  secondaryLight: '#F3E8FF',
  background: '#F8F9FC',
  card: '#FFFFFF',
  
  // Gradients
  primaryGradient: ['#6C63FF', '#8B5CF6'] as const,
  secondaryGradient: ['#8B5CF6', '#A78BFA'] as const,
  glassGradient: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'] as const,

  // Text
  textPrimary: '#1E1B4B',   // Dark Indigo/Navy for headings
  textSecondary: '#4F46E5', // Indigo body text
  textMuted: '#6B7280',     // Neutral gray for description/placeholder
  textLight: '#FFFFFF',     // Contrast text

  // Priority Colors
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',

  priorityHighBg: '#FEE2E2',
  priorityMediumBg: '#FEF3C7',
  priorityLowBg: '#D1FAE5',

  // Status Colors
  statusPending: '#F59E0B',
  statusInProgress: '#3B82F6',
  statusCompleted: '#10B981',

  statusPendingBg: '#FEF3C7',
  statusInProgressBg: '#DBEAFE',
  statusCompletedBg: '#D1FAE5',

  // Utility
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  shadow: '#6C63FF',
};
