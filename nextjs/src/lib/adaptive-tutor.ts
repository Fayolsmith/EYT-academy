/**
 * Adaptive Tutor Character & Sequencing Service
 * Mrs Sarah Early Years Tutoring Platform
 * 
 * CORE ARCHITECTURAL RULE:
 * Absolutely NO live generative AI conversation with a child.
 * All dialogue lines are pre-approved, templated text.
 * The "AI" is deterministic, rules-based adaptive sequencing logic that
 * inspects the child's current milestone progress and selects appropriate
 * learning content from Mrs Sarah's curated resources and interactive mini-activities.
 */

import { EYTService, Milestone, Resource, Assignment } from './eyt-service';

export type LearningPillar = 'numeracy' | 'phonics' | 'practical_life' | 'cultural' | 'arts';

export interface MascotDialogueOption {
  id: string;
  label: string;
  action: 'start_activity' | 'view_homework' | 'switch_activity' | 'celebrate' | 'rest';
  pillar?: LearningPillar;
  resourceId?: string;
  assignmentId?: string;
}

export interface AdaptiveRecommendation {
  pillar: LearningPillar;
  pillarTitle: string;
  pillarIcon: string;
  milestone?: Milestone;
  milestoneStatus: 'in_progress' | 'not_started' | 'achieved';
  reason: string;
  mascotGreeting: string;
  mascotPrompt: string;
  recommendedResource?: Resource;
  activeAssignment?: Assignment;
  options: MascotDialogueOption[];
}

const PILLAR_METADATA: Record<LearningPillar, { title: string; icon: string; subjectArea: string }> = {
  numeracy: {
    title: 'Numeracy & Mathematics',
    icon: 'hash',
    subjectArea: 'numeracy',
  },
  phonics: {
    title: 'Phonics & Early Literacy',
    icon: 'book-open',
    subjectArea: 'literacy',
  },
  practical_life: {
    title: 'Practical Life Skills',
    icon: 'scissors',
    subjectArea: 'practical_life',
  },
  cultural: {
    title: 'Cultural & General Knowledge',
    icon: 'globe',
    subjectArea: 'cultural',
  },
  arts: {
    title: 'Creative & Expressive Arts',
    icon: 'palette',
    subjectArea: 'arts',
  },
};

/**
 * Maps subject area to learning pillar
 */
export function subjectAreaToPillar(subjectArea: string): LearningPillar {
  switch (subjectArea) {
    case 'literacy':
      return 'phonics';
    case 'numeracy':
      return 'numeracy';
    case 'practical_life':
      return 'practical_life';
    case 'cultural':
      return 'cultural';
    case 'arts':
      return 'arts';
    default:
      return 'numeracy';
  }
}

export class AdaptiveTutorService {
  /**
   * Deterministic sequencing logic that selects the next best activity for the child.
   * Driven strictly by the child's recorded milestone progression and Mrs Sarah's assignments.
   */
  static getNextRecommendation(childId: string, childName: string = 'Friend'): AdaptiveRecommendation {
    const childMilestones = EYTService.getChildMilestones(childId);
    const allMilestones = EYTService.getMilestones();
    const assignments = EYTService.getAssignments(childId, 'assigned');
    const resources = EYTService.getResources();
    const dueAssignment = assignments.length > 0 ? assignments[0] : undefined;

    const firstName = childName.split(' ')[0] || 'Friend';

    // Priority 0: Check if all 5 pillars are already completed today
    if (EYTService.isAllPillarsCompletedToday(childId)) {
      return {
        pillar: 'arts',
        pillarTitle: 'All 5 Montessori Activities Completed!',
        pillarIcon: 'star',
        milestoneStatus: 'achieved',
        reason: 'Superstar! You completed all five Montessori pillars today!',
        mascotGreeting: `Incredible work today, ${firstName}!`,
        mascotPrompt: `You completed all five Montessori pillars today! Mrs Sarah is so proud of you. Take a wonderful break or explore your Star Trophies!`,
        activeAssignment: dueAssignment,
        options: [
          ...(dueAssignment
            ? [
                {
                  id: 'do_homework',
                  label: `Today's Home Practice`,
                  action: 'view_homework' as const,
                  assignmentId: dueAssignment.id,
                },
              ]
            : []),
          {
            id: 'view_trophies',
            label: 'Explore Star Trophies',
            action: 'switch_activity' as const,
          },
        ],
      };
    }

    // Priority 0.5: If today's sequence is in progress, recommend the next incomplete pillar
    const nextIncompletePillar = EYTService.getNextIncompletePillar(childId);
    const todayProgress = EYTService.getChildModeProgress(childId);
    if (todayProgress && todayProgress.pillars_completed.length > 0 && nextIncompletePillar) {
      const meta = PILLAR_METADATA[nextIncompletePillar];
      const matchedResource = resources.find((r) => r.subject_area === meta.subjectArea);
      return {
        pillar: nextIncompletePillar,
        pillarTitle: meta.title,
        pillarIcon: meta.icon,
        milestoneStatus: 'in_progress',
        reason: `Next up in today's 5-pillar journey: ${meta.title}!`,
        mascotGreeting: `Welcome back, ${firstName}!`,
        mascotPrompt: `You're doing wonderful today! Ready for your next adventure: ${meta.title}?`,
        recommendedResource: matchedResource,
        activeAssignment: dueAssignment,
        options: [
          {
            id: 'continue_pillar',
            label: `Continue to ${meta.title}`,
            action: 'start_activity',
            pillar: nextIncompletePillar,
          },
          ...(dueAssignment
            ? [
                {
                  id: 'do_homework',
                  label: `Today's Home Practice`,
                  action: 'view_homework' as const,
                  assignmentId: dueAssignment.id,
                },
              ]
            : []),
          {
            id: 'choose_another',
            label: 'See All Activities',
            action: 'switch_activity',
          },
        ],
      };
    }

    // 1. Check if there is an active assigned homework task
    // 2. Priority A: Find any milestone currently marked 'in_progress'
    const inProgressRecord = childMilestones.find((cm) => cm.status === 'in_progress');
    if (inProgressRecord && inProgressRecord.milestone) {
      const milestone = inProgressRecord.milestone;
      const pillar = subjectAreaToPillar(milestone.subject_area);
      const meta = PILLAR_METADATA[pillar];
      const matchedResource = resources.find((r) => r.subject_area === milestone.subject_area);

      return {
        pillar,
        pillarTitle: meta.title,
        pillarIcon: meta.icon,
        milestone,
        milestoneStatus: 'in_progress',
        reason: `You are currently practicing "${milestone.name}" with Mrs Sarah!`,
        mascotGreeting: `Hi ${firstName}! I'm Pip!`,
        mascotPrompt: `Mrs Sarah noticed you're practicing ${milestone.name}. Let's try our fun ${meta.title} game together!`,
        recommendedResource: matchedResource,
        activeAssignment: dueAssignment,
        options: [
          {
            id: 'play_recommended',
            label: `Let's Play ${meta.title}!`,
            action: 'start_activity',
            pillar,
          },
          ...(dueAssignment
            ? [
                {
                  id: 'do_homework',
                  label: `Today's Home Practice`,
                  action: 'view_homework' as const,
                  assignmentId: dueAssignment.id,
                },
              ]
            : []),
          {
            id: 'choose_another',
            label: 'Explore Other Activities',
            action: 'switch_activity',
          },
        ],
      };
    }

    // 3. Priority B: Find next unstarted milestone in foundational curriculum order
    const achievedMilestoneIds = new Set(
      childMilestones.filter((cm) => cm.status === 'achieved').map((cm) => cm.milestone_id)
    );

    const pillarOrder: LearningPillar[] = ['phonics', 'numeracy', 'practical_life', 'cultural', 'arts'];

    for (const p of pillarOrder) {
      const meta = PILLAR_METADATA[p];
      const unstartedForPillar = allMilestones.find(
        (m) => m.subject_area === meta.subjectArea && !achievedMilestoneIds.has(m.id)
      );

      if (unstartedForPillar) {
        const matchedResource = resources.find((r) => r.subject_area === meta.subjectArea);

        return {
          pillar: p,
          pillarTitle: meta.title,
          pillarIcon: meta.icon,
          milestone: unstartedForPillar,
          milestoneStatus: 'not_started',
          reason: `Next skill on your learning journey: "${unstartedForPillar.name}".`,
          mascotGreeting: `Hello ${firstName}! I'm Pip!`,
          mascotPrompt: `Ready for an exciting adventure today? Let's explore ${meta.title}!`,
          recommendedResource: matchedResource,
          activeAssignment: dueAssignment,
          options: [
            {
              id: 'play_next',
              label: `Start ${meta.title}`,
              action: 'start_activity',
              pillar: p,
            },
            ...(dueAssignment
              ? [
                  {
                    id: 'do_homework',
                    label: `Today's Home Practice`,
                    action: 'view_homework' as const,
                    assignmentId: dueAssignment.id,
                  },
                ]
              : []),
            {
              id: 'choose_another',
              label: 'See All Activities',
              action: 'switch_activity',
            },
          ],
        };
      }
    }

    // 4. Priority C: If all foundational milestones achieved!
    const celebratoryPillar: LearningPillar = 'arts';
    const meta = PILLAR_METADATA[celebratoryPillar];

    return {
      pillar: celebratoryPillar,
      pillarTitle: meta.title,
      pillarIcon: meta.icon,
      milestoneStatus: 'achieved',
      reason: `Superstar! You have practiced all your core milestones with Mrs Sarah!`,
      mascotGreeting: `Splendid job, ${firstName}!`,
      mascotPrompt: `You are shining so brightly! Would you like to create colorful art or practice your favorite game today?`,
      activeAssignment: dueAssignment,
      options: [
        {
          id: 'play_art',
          label: 'Play Color Matching',
          action: 'start_activity',
          pillar: 'arts',
        },
        {
          id: 'play_beads',
          label: 'Play Golden Beads',
          action: 'start_activity',
          pillar: 'numeracy',
        },
        {
          id: 'choose_another',
          label: 'Choose Any Game',
          action: 'switch_activity',
        },
      ],
    };
  }

  /**
   * Pre-approved encouraging phrases Pip can say during mini-activities.
   * Completely static templated lines — strictly zero generative AI generation.
   */
  static getEncouragingLine(pillar: LearningPillar, childName: string = 'Superstar'): string {
    const firstName = childName.split(' ')[0] || 'Superstar';
    const linesByPillar: Record<LearningPillar, string[]> = {
      numeracy: [
        `Count each bead carefully, ${firstName}! One by one!`,
        `Splendid concentration with your golden beads, ${firstName}!`,
        `Look at those shiny beads! You are building real number sense!`,
      ],
      phonics: [
        `Listen to the sound gently, ${firstName}. Can you feel it on the sandpaper?`,
        `Splendid phonics work! Letters make such wonderful sounds!`,
        `You are sounding like a confident reader already, ${firstName}!`,
      ],
      practical_life: [
        `First things first! Order and calm make our workspace happy.`,
        `Terrific sequencing, ${firstName}! Mrs Sarah loves your careful hands!`,
        `Independence is your superpower! Step by step!`,
      ],
      cultural: [
        `Nature is full of fascinating wonders, ${firstName}!`,
        `Great scientific observation! You know what lives and grows!`,
        `Curious minds discover the most wonderful things!`,
      ],
      arts: [
        `Look closely at the subtle shades, ${firstName}!`,
        `Your eyes are so sharp at noticing beautiful colors!`,
        `Art and beauty make our learning joyful!`,
      ],
    };

    const choices = linesByPillar[pillar] || linesByPillar.numeracy;
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
  }
}
