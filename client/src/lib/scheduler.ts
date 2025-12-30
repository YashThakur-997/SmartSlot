
export type Priority = "Low" | "Medium" | "High";

export interface SubjectInput {
    id: string;
    name: string;
    priority: Priority;
    targetMinutes: number; // Total target minutes for the entire schedule
    color: string;
    difficulty?: string;
    notes?: string;
}

export interface SchedulerConfig {
    startTime: string; // "HH:MM" 24h format
    endTime: string;   // "HH:MM" 24h format
    slotDuration: number; // minutes
    studyDays: string[]; // ["Mon", "Tue", ...]
    autoBalance: boolean; // True = spread evenly, False = fill sequentially
    sameScheduleEveryDay: boolean; // True = Mon schedule repeated
    breakStrategy?: {
        frequency: number; // every N slots
        duration: number; // minutes
    };
    randomize?: boolean; // New: Randomize slot allocation
}


export interface ScheduleSlot {
    id: string; // unique slot id
    day: string;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    subject: SubjectInput | null; // null = free/break
    type: 'study' | 'break' | 'empty';
    isFloating?: boolean; // if true, it wasn't perfectly instantiated? (optional)
}

export interface ScheduleResult {
    schedule: Record<string, ScheduleSlot[]>; // Map of Day -> Slots
    unallocatedSubjects: { subject: SubjectInput, remainingMinutes: number }[];
    warnings: string[];
    totalSlotsPerDay: number;
}

/**
 * Helper to converting "HH:MM" to minutes from midnight
 */
export const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Helper to convert minutes from midnight to "HH:MM"
 */
export const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Main Scheduler Function
 */
export function generateSmartSchedule(
    subjects: SubjectInput[],
    config: SchedulerConfig
): ScheduleResult {
    const { startTime, endTime, slotDuration, studyDays, autoBalance, breakStrategy, sameScheduleEveryDay, randomize } = config;
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    // 1. Calculate capacity
    const dayDuration = endMins - startMins;
    if (dayDuration <= 0) {
        return { schedule: {}, unallocatedSubjects: [], warnings: ["End time must be after start time."], totalSlotsPerDay: 0 };
    }

    // Initialize Grid
    // If sameScheduleEveryDay is TRUE, we only need to generate for the first day, then copy.
    // If FALSE, we generate for all days.

    // For allocation logic, if sameScheduleEveryDay is TRUE, we treat the standard "targetMinutes" as "Minutes Per Day" 
    // (Wait, the caller usually sends Total Minutes. Let's standarize: 
    //  The AGENT/UI decides the `targetMinutes`. 
    //  If `sameScheduleEveryDay` is true, the `targetMinutes` passed in MUST BE PER DAY or adjusted. 
    //  Let's assume the passed `targetMinutes` is the TOTAL POOL we are allowed to use.
    //  However, for identical days, it's easier if we just allocate for one day using `targetMinutes / days`? 
    //  NO. Let's make the logic robust: 
    //  If sameScheduleEveryDay, we run allocation on a single dummy day, using `targetMinutes / studyDays.length` (if total) OR just use the input if the caller handled it.
    //  
    //  DECISION: The scheduler expects `subject.targetMinutes` to be the TOTAL amount of time to allocate across ALL requested days.
    //  It is the caller's responsibility (DataEntry.tsx) to multiply Daily * Days if needed.
    // )

    // Grid Initialization with Linear Timeline Construction
    const schedule: Record<string, ScheduleSlot[]> = {};

    // Active days to run allocation on. 
    // If sameSchedule, we only run on the first day, then copy.
    const uniqueAllocationDays = sameScheduleEveryDay ? [studyDays[0]] : studyDays;

    uniqueAllocationDays.forEach(day => {
        schedule[day] = [];
        let currentMins = startMins;
        let consecutiveStudySlots = 0;

        while (currentMins + slotDuration <= endMins) {
            // 1. Check if we need to insert a Break FIRST
            // We insert a break if we have completed a batch of 'frequency' study slots.
            const isBreakDue = breakStrategy
                && breakStrategy.frequency > 0
                && consecutiveStudySlots > 0
                && consecutiveStudySlots % breakStrategy.frequency === 0;

            if (isBreakDue) {
                const breakDur = breakStrategy!.duration;
                // Ensure break fits (optional, usually breaks can go momentarily over, or strictly enforced)
                // Let's enforce strictly: break must start before endTime.
                if (currentMins + breakDur > endMins) {
                    break; // Stop if no room for break
                }

                schedule[day].push({
                    id: `${day}-break-${currentMins}`,
                    day,
                    startTime: minutesToTime(currentMins),
                    endTime: minutesToTime(currentMins + breakDur),
                    subject: null,
                    type: 'break'
                });

                currentMins += breakDur;
                consecutiveStudySlots = 0; // Reset counter after break
                continue; // Continue loop to try adding next slot
            }

            // 2. Insert Empty Study Slot
            schedule[day].push({
                id: `${day}-slot-${currentMins}`,
                day,
                startTime: minutesToTime(currentMins),
                endTime: minutesToTime(currentMins + slotDuration),
                subject: null,
                type: 'empty'
            });

            currentMins += slotDuration;
            consecutiveStudySlots++;
        }
    });

    // Helper to shuffle array (Fisher-Yates)
    const shuffleArray = <T>(array: T[]): T[] => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    // 2. Sort Subjects by Priority
    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    const sortedSubjects = [...subjects].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    const warnings: string[] = [];
    const unallocated: { subject: SubjectInput, remainingMinutes: number }[] = [];

    // 3. Allocation Logic
    sortedSubjects.forEach(subject => {
        // If sameScheduleEveryDay, we need to scale the target down to 1 day for the calculation
        // assuming subject.targetMinutes is the TOTAL for the whole period.
        let totalMinutesForPeriod = subject.targetMinutes;

        let minutesToAllocate = sameScheduleEveryDay
            ? Math.floor(totalMinutesForPeriod / studyDays.length)
            : totalMinutesForPeriod;

        // Safety: Ensure at least one slot if minutes > 0 but < slotDuration (handling rounding errors)
        // usage of ceil in slotsNeeded helps.

        let slotsNeeded = Math.ceil(minutesToAllocate / slotDuration);
        let slotsAllocatedSuccessfully = 0;

        if (autoBalance && !sameScheduleEveryDay) {
            // Strategy: Spread slotsNeeded across the uniqueAllocationDays (which is all days)
            const daysCount = uniqueAllocationDays.length;
            const baseSlotsPerDay = Math.floor(slotsNeeded / daysCount);
            let remainderSlots = slotsNeeded % daysCount;

            uniqueAllocationDays.forEach((day) => {
                let targetForThisDay = baseSlotsPerDay + (remainderSlots > 0 ? 1 : 0);
                if (remainderSlots > 0) remainderSlots--;

                // Find all empty slots
                let availableIndices: number[] = [];
                for (let i = 0; i < schedule[day].length; i++) {
                    if (schedule[day][i].type === 'empty') availableIndices.push(i);
                }

                // Randomize if requested
                if (randomize) {
                    availableIndices = shuffleArray(availableIndices);
                }

                let placedCount = 0;
                for (const idx of availableIndices) {
                    if (placedCount >= targetForThisDay) break;

                    schedule[day][idx].type = 'study';
                    schedule[day][idx].subject = subject;
                    placedCount++;
                    slotsAllocatedSuccessfully++;
                }
            });

        } else {
            // Sequential Fill (Standard Mode OR SameSchedule Mode which is 1 day sequential)
            // Fill available slots in order
            for (const day of uniqueAllocationDays) {
                // Find all empty slots for this day
                let availableIndices: number[] = [];
                for (let i = 0; i < schedule[day].length; i++) {
                    if (schedule[day][i].type === 'empty') availableIndices.push(i);
                }

                // Randomize if requested
                if (randomize) {
                    availableIndices = shuffleArray(availableIndices);
                }

                for (const idx of availableIndices) {
                    if (slotsAllocatedSuccessfully >= slotsNeeded) break;

                    schedule[day][idx].type = 'study';
                    schedule[day][idx].subject = subject;
                    slotsAllocatedSuccessfully++;
                }

                if (slotsAllocatedSuccessfully >= slotsNeeded) break;
            }
        }

        const placedMinutes = slotsAllocatedSuccessfully * slotDuration; // Per allocation cycle
        const totalPlacedOriginalScale = sameScheduleEveryDay ? placedMinutes * studyDays.length : placedMinutes;

        if (totalPlacedOriginalScale < subject.targetMinutes) {
            // Tolerance check (if < 1 slot missing, ignore? No, show warning)
            // Only warn if significant miss
            if (subject.targetMinutes - totalPlacedOriginalScale >= slotDuration) {
                unallocated.push({
                    subject,
                    remainingMinutes: subject.targetMinutes - totalPlacedOriginalScale
                });
            }
        }
    });

    // 4. If Same Schedule, clone Day 1 to others
    if (sameScheduleEveryDay) {
        const sourceDay = uniqueAllocationDays[0];
        const sourceSlots = schedule[sourceDay];

        studyDays.slice(1).forEach(day => {
            schedule[day] = sourceSlots.map(slot => ({
                ...slot,
                id: slot.id.replace(sourceDay, day),
                day: day
            }));
        });
    }

    if (unallocated.length > 0) {
        warnings.push("Could not allocate all target hours. Increase duration or days.");
    }

    // 4. Insert Breaks (Post-processing)
    // If we want to strictly follow "Every X slots", we might need to overwrite or shift? 
    // Shifting is hard in a fixed grid. Overwriting effectively reduces study time.
    // Better strategy: Reserve specific slots for breaks beforehand? 
    // Or: "If break is needed, convert the next slot to break" -> might delete a high priority task?
    // Let's implement a simple "Shift/Overwrite" warning or just simpler logic:
    // If breakStrategy is present, we turn every Nth slot into a break, regardless of what's there?
    // Or better: When initializing the grid, mark slots as breaks?
    // Let's go with: "Every N slots from start".
    if (breakStrategy && breakStrategy.frequency > 0) {
        studyDays.forEach(day => {
            const slots = schedule[day];
            for (let i = breakStrategy.frequency; i < slots.length; i += (breakStrategy.frequency + 1)) {
                // Warning: This is naive. 
                // If we overwrite a subject, we lose work. 
                // Real scheduler would factor breaks into capacity.
                // Correct approach: Reduce capacity during step 1.
            }
        });
    }

    // CORRECT BREAK APPROACH: Pre-allocate breaks
    // Let's re-run the initialization if breaks are critical. 
    // For this generic code, we'll skip complex break shifting for now as the prompt focuses on "Subject Allocation".
    // I will return the schedule as is. The user can manually add breaks or we can refine logic later.
    // Actually, let's implement a simple `isBreak` check during allocation?
    // Better: Helper function to mark breaks.

    return {
        schedule,
        unallocatedSubjects: unallocated,
        warnings,
        totalSlotsPerDay: schedule[uniqueAllocationDays[0]]?.length || 0
    };
}
