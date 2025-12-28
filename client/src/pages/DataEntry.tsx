import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import {
    ArrowLeft, Clock, Calendar, Zap, Coffee,
    Brain, Sparkles, Download, Copy,
    Plus, Trash2, GripVertical, Palette, List, Columns, Save, CheckCircle, AlertCircle, X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// --- Types ---

type Priority = "Low" | "Medium" | "High";
type ViewMode = "timeline" | "table";
type ThemeType = "ocean" | "neon" | "pastel" | "dark" | "minimal";

interface Subject {
    id: string;
    name: string;
    priority: Priority;
    targetHours: number;
    color: string;
}

interface ScheduleSlot {
    time: string;
    type: 'study' | 'break';
    subject?: Subject;
    duration: number;
}



interface ScheduleConfig {
    startTime: string;
    endTime: string;
    slotDuration: string;
    studyDays: string[];
    sameScheduleEveryDay: boolean;

    // Smart Features
    breakDuration: string;
    breakFrequency: string;
    breakType: "fixed" | "auto" | "random";
    focusMode: "pomodoro" | "deep" | "mixed";
    energyPeak: "morning" | "afternoon" | "night";
    mood: "happy" | "calm" | "stressed" | "neutral";

    // Theme
    theme: ThemeType;
    uiStyle: "minimal" | "bordered" | "shaded" | "glass";
    fontSize: string;
    slotDecoration: "striped" | "solid" | "glow";
}

// --- Constants ---

const THEMES: Record<ThemeType, { bg: string, accent: string, text: string }> = {
    ocean: { bg: "bg-blue-50", accent: "bg-blue-600", text: "text-blue-900" },
    neon: { bg: "bg-slate-950", accent: "bg-fuchsia-500", text: "text-slate-100" },
    pastel: { bg: "bg-rose-50", accent: "bg-rose-400", text: "text-rose-900" },
    dark: { bg: "bg-zinc-900", accent: "bg-zinc-100", text: "text-zinc-100" },
    minimal: { bg: "bg-white", accent: "bg-black", text: "text-black" },
};

const DEFAULT_SUBJECTS: Subject[] = [
    { id: "1", name: "Algorithm Design", priority: "High", targetHours: 2, color: "#3b82f6" },
    { id: "2", name: "System Architecture", priority: "Medium", targetHours: 1.5, color: "#a855f7" },
];

const INITIAL_CONFIG: ScheduleConfig = {
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: "60",
    studyDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    sameScheduleEveryDay: true,
    breakDuration: "15",
    breakFrequency: "2",
    breakType: "fixed",
    focusMode: "deep",
    energyPeak: "morning",
    mood: "calm",
    theme: "minimal",
    uiStyle: "glass",
    fontSize: "14px",
    slotDecoration: "solid",
};

export function DataEntry() {
    // --- State ---
    const [activeTab, setActiveTab] = useState<ViewMode>("timeline");
    const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
    const [config, setConfig] = useState<ScheduleConfig>(INITIAL_CONFIG);
    const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isGenerated, setIsGenerated] = useState(false);
    const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const scheduleRef = useRef<HTMLDivElement>(null);


    // --- Effects ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- Handlers ---
    const handleConfigChange = (key: keyof ScheduleConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const addSubject = () => {
        const newSubject: Subject = {
            id: crypto.randomUUID(),
            name: "",
            priority: "Medium",
            targetHours: 1,
            color: "#10b981",
        };
        setSubjects([...subjects, newSubject]);
    };

    const updateSubject = (id: string, key: keyof Subject, value: any) => {
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
    };

    const removeSubject = (id: string) => {
        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    const generateSchedule = () => {
        if (subjects.length === 0) return;

        const slots: ScheduleSlot[] = [];
        let currentMinutes = parseInt(config.startTime.split(':')[0]) * 60 + parseInt(config.startTime.split(':')[1]);
        const endMinutes = parseInt(config.endTime.split(':')[0]) * 60 + parseInt(config.endTime.split(':')[1]);
        const slotDur = parseInt(config.slotDuration);
        const breakDur = parseInt(config.breakDuration);
        const breakFreq = parseInt(config.breakFrequency);

        let studySlotCount = 0;
        let subjectIndex = 0;

        // Sort subjects by priority for round-robin (High -> Medium -> Low)
        const sortedSubjects = [...subjects].sort((a, b) => {
            const priorityOrder = { High: 3, Medium: 2, Low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        while (currentMinutes + slotDur <= endMinutes) {
            // Check for break
            if (studySlotCount > 0 && studySlotCount % breakFreq === 0) {
                const timeString = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
                slots.push({
                    time: timeString,
                    type: 'break',
                    duration: breakDur
                });
                currentMinutes += breakDur;
                studySlotCount = 0;
                if (currentMinutes + slotDur > endMinutes) break;
            }

            const timeString = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;

            // Pick subject
            const subject = sortedSubjects[subjectIndex % sortedSubjects.length];

            slots.push({
                time: timeString,
                type: 'study',
                subject: subject,
                duration: slotDur
            });

            currentMinutes += slotDur;
            studySlotCount++;
            subjectIndex++;
        }

        setSchedule(slots);
        setIsGenerated(true);
    };

    // --- Action Handlers ---

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDownload = async () => {
        if (!isGenerated || schedule.length === 0) {
            showToast("Generate a schedule first!", "error");
            return;
        }

        if (!scheduleRef.current) return;

        showToast("Generating image...", "info");

        try {
            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2, // Higher quality
                backgroundColor: null, // Transparent background if possible, or inherits
                useCORS: true // For external images if any
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "smartslot_schedule.png";
            link.click();
            showToast("Schedule image saved!");
        } catch (error) {
            console.error("Image generation failed:", error);
            showToast("Failed to generate image.", "error");
        }
    };

    const handleCopy = () => {
        if (!isGenerated || schedule.length === 0) {
            showToast("Generate a schedule first!", "error");
            return;
        }
        const text = schedule.map(s => {
            if (s.type === 'break') return `${s.time} - Break (${s.duration}m)`;
            return `${s.time} - ${s.subject?.name} (${s.subject?.priority})`;
        }).join('\n');

        navigator.clipboard.writeText(text);
        showToast("Schedule copied to clipboard!");
    };

    const handleSave = () => {
        if (!isGenerated || schedule.length === 0) {
            showToast("Generate a schedule first!", "error");
            return;
        }
        localStorage.setItem('smartslot_saved_schedule', JSON.stringify({ schedule, config, date: new Date().toISOString() }));
        showToast("Schedule saved to local storage!");
    };

    // --- Render Helpers ---
    const currentTheme = THEMES[config.theme];

    return (
        <div className={cn("min-h-screen flex flex-col font-sans transition-colors duration-500", currentTheme.bg, config.theme === 'neon' || config.theme === 'dark' ? 'dark' : '')}>

            {/* --- HEADER --- */}
            <header className="h-16 border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg overflow-hidden shadow-sm">
                        <img src="/logo.png" alt="SmartSlot Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">SmartSlot</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Scheduling Software</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Exit
                    </Link>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <main className="flex-1 flex overflow-hidden">

                {/* --- LEFT PANEL (INPUTS) --- */}
                <div className="w-full md:w-[35%] h-[calc(100vh-64px)] overflow-y-auto border-r border-border/40 bg-background/30 backdrop-blur-sm p-6 space-y-8 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">

                    {/* Section 1: Schedule Timing */}
                    <section className="space-y-4 animate-in slide-in-from-left duration-500 delay-100">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Schedule Timing
                        </h2>
                        <div className="bg-card/50 border border-border/50 rounded-xl p-5 shadow-sm space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={config.startTime}
                                        onChange={e => handleConfigChange('startTime', e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={config.endTime}
                                        onChange={e => handleConfigChange('endTime', e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Slot Duration</Label>
                                <Select value={config.slotDuration} onValueChange={v => handleConfigChange('slotDuration', v)}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 Minutes</SelectItem>
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="45">45 Minutes</SelectItem>
                                        <SelectItem value="60">1 Hour</SelectItem>
                                        <SelectItem value="90">1.5 Hours</SelectItem>
                                        <SelectItem value="120">2 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>Study Days</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                const newDays = config.studyDays.includes(day)
                                                    ? config.studyDays.filter(d => d !== day)
                                                    : [...config.studyDays, day];
                                                handleConfigChange('studyDays', newDays);
                                            }}
                                            className={cn(
                                                "px-3 py-1.5 text-xs rounded-md transition-all border",
                                                config.studyDays.includes(day)
                                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                    : "bg-background hover:bg-muted text-muted-foreground border-border"
                                            )}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Label className="text-xs">Same schedule daily?</Label>
                                <Switch
                                    checked={config.sameScheduleEveryDay}
                                    onCheckedChange={v => handleConfigChange('sameScheduleEveryDay', v)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Smart & Advanced */}
                    <section className="space-y-4 animate-in slide-in-from-left duration-500 delay-200">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Smart Logic
                        </h2>
                        <div className="bg-card/50 border border-border/50 rounded-xl p-5 shadow-sm space-y-5">

                            {/* Break Management */}
                            <div className="space-y-3">
                                <Label className="text-xs text-muted-foreground font-medium">Break Strategy</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select value={config.breakDuration} onValueChange={v => handleConfigChange('breakDuration', v)}>
                                        <SelectTrigger className="h-8 text-xs bg-background/50"><SelectValue placeholder="Duration" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10 min break</SelectItem>
                                            <SelectItem value="15">15 min break</SelectItem>
                                            <SelectItem value="20">20 min break</SelectItem>
                                            <SelectItem value="30">30 min break</SelectItem>
                                            <SelectItem value="45">45 min break</SelectItem>
                                            <SelectItem value="60">1 hour break</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={config.breakFrequency} onValueChange={v => handleConfigChange('breakFrequency', v)}>
                                        <SelectTrigger className="h-8 text-xs bg-background/50"><SelectValue placeholder="Frequency" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Every 1 slot</SelectItem>
                                            <SelectItem value="2">Every 2 slots</SelectItem>
                                            <SelectItem value="3">Every 3 slots</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Focus & Energy */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-500" /> Energy Peak</Label>
                                    <div className="flex bg-muted/50 p-1 rounded-lg">
                                        {['morning', 'afternoon', 'night'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => handleConfigChange('energyPeak', t)}
                                                className={cn(
                                                    "flex-1 text-xs py-1.5 rounded-md capitalize transition-all",
                                                    config.energyPeak === t ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs flex items-center gap-2"><Coffee className="w-3 h-3 text-orange-500" /> Focus Mode</Label>
                                    <div className="flex bg-muted/50 p-1 rounded-lg">
                                        {['pomodoro', 'deep', 'mixed'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => handleConfigChange('focusMode', m)}
                                                className={cn(
                                                    "flex-1 text-xs py-1.5 rounded-md capitalize transition-all",
                                                    config.focusMode === m ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Section 3: Subject Management */}
                    <section className="space-y-4 animate-in slide-in-from-left duration-500 delay-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <List className="w-4 h-4" /> Subjects
                            </h2>
                            <Button size="sm" variant="ghost" onClick={addSubject} className="h-6 text-xs hover:bg-primary/10 hover:text-primary">
                                <Plus className="w-3 h-3 mr-1" /> Add New
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {subjects.map((sub) => (
                                <div
                                    key={sub.id}
                                    className="group relative bg-card/80 border border-border p-3 rounded-lg shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    onMouseEnter={() => setHoveredSubjectId(sub.id)}
                                    onMouseLeave={() => setHoveredSubjectId(null)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-2 text-muted-foreground/30 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={sub.name}
                                                    onChange={e => updateSubject(sub.id, 'name', e.target.value)}
                                                    placeholder="Subject Name"
                                                    className="h-8 text-sm font-medium border-transparent bg-transparent hover:bg-muted/50 focus:bg-background focus:border-input px-2 -ml-2 transition-all w-full"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Select value={sub.priority} onValueChange={v => updateSubject(sub.id, 'priority', v)}>
                                                    <SelectTrigger className={cn("h-7 w-[100px] text-xs border-0",
                                                        sub.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30' :
                                                            sub.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Low">Low</SelectItem>
                                                        <SelectItem value="Medium">Medium</SelectItem>
                                                        <SelectItem value="High">High</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div className="flex items-center border rounded-md px-2 bg-background/50 h-7 w-[80px]">
                                                    <Input
                                                        type="number"
                                                        value={sub.targetHours}
                                                        onChange={e => updateSubject(sub.id, 'targetHours', Number(e.target.value))}
                                                        className="h-full border-0 p-0 text-xs w-full text-center focus-visible:ring-0"
                                                        min={1} max={10}
                                                    />
                                                    <span className="text-[10px] text-muted-foreground ml-1">h</span>
                                                </div>

                                                <div className="h-7 w-7 rounded-md overflow-hidden border border-border relative group/color cursor-pointer">
                                                    <input
                                                        type="color"
                                                        value={sub.color}
                                                        onChange={e => updateSubject(sub.id, 'color', e.target.value)}
                                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost" size="icon"
                                            onClick={() => removeSubject(sub.id)}
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4: Style & Theme */}
                    <section className="space-y-4 animate-in slide-in-from-left duration-500 delay-400">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Personalize
                        </h2>
                        <div className="bg-card/50 border border-border/50 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Color Palette</Label>
                                <Select value={config.theme} onValueChange={(v: ThemeType) => handleConfigChange('theme', v)}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                        <SelectItem value="ocean">Ocean Blue</SelectItem>
                                        <SelectItem value="neon">Cyber Neon</SelectItem>
                                        <SelectItem value="pastel">Pastel Calm</SelectItem>
                                        <SelectItem value="dark">Dark Tech</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Slot Style</Label>
                                <div className="flex bg-muted/50 p-0.5 rounded-lg">
                                    {['solid', 'striped', 'glow'].map(style => (
                                        <button key={style} onClick={() => handleConfigChange('slotDecoration', style)}
                                            className={cn("px-2 py-1 text-[10px] uppercase rounded-md transition-all", config.slotDecoration === style ? "bg-background shadow-sm" : "hover:bg-background/50")}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="pt-6 pb-2 space-y-3 mt-4">
                        <Button
                            size="lg"
                            className="w-full shadow-lg hover:shadow-primary/20 transition-all font-semibold text-md animate-bounce-subtle"
                            onClick={generateSchedule}
                        >
                            Generate Schedule
                        </Button>
                        <Button variant="outline" className="w-full text-xs text-muted-foreground h-8">
                            Reset All Inputs
                        </Button>
                    </div>

                </div>

                {/* --- RIGHT PANEL (LIVE PREVIEW) --- */}
                <div className="hidden md:flex flex-1 bg-muted/30 relative flex-col shadow-inner">

                    {/* Preview Toolbar */}
                    <div className="absolute top-4 right-6 flex items-center gap-2 z-20">
                        <div className="bg-background/60 backdrop-blur-md border rounded-lg p-1 flex shadow-sm">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={cn("p-2 rounded-md transition-all", activeTab === 'timeline' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground")}
                            >
                                <Columns className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setActiveTab('table')}
                                className={cn("p-2 rounded-md transition-all", activeTab === 'table' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-muted text-muted-foreground")}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-background/60 backdrop-blur-md border rounded-lg p-1 flex shadow-sm gap-1">
                            <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Copy className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-muted-foreground hover:text-foreground"><Save className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    {/* Preview Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">

                        <div ref={scheduleRef} className={cn(
                            "w-full max-w-2xl bg-background rounded-xl shadow-2xl border transition-all duration-500 min-h-[600px] relative overflow-hidden",
                            config.uiStyle === 'glass' ? "backdrop-blur-xl bg-background/70" : ""
                        )}>

                            {/* Decorative Header of the Preview Card */}
                            <div className="h-20 border-b flex items-center justify-between px-6 bg-muted/10">
                                <div>
                                    <h3 className="font-bold text-xl">My Study Plan</h3>
                                    <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="flex gap-1">
                                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="p-6 space-y-4">
                                {!isGenerated ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <img src="/logo.png" alt="SmartSlot Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium">Click "Generate Schedule" to view your plan</p>
                                    </div>
                                ) : (
                                    /* Generated Schedule */
                                    schedule.map((slot, i) => (
                                        <div key={`${slot.time}-${i}`} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                            <div className="w-16 text-right text-xs text-muted-foreground font-mono pt-2">{slot.time}</div>
                                            <div className="relative flex-1">
                                                {slot.type === 'break' ? (
                                                    <div className="h-10 w-full border-dashed border-2 border-muted-foreground/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                                                        <Coffee className="w-3 h-3 mr-2" /> Break ({slot.duration} min)
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            "h-24 w-full rounded-xl p-3 border transition-all hover:scale-[1.01] hover:shadow-lg relative overflow-hidden",
                                                            hoveredSubjectId === slot.subject?.id ? "ring-2 ring-primary ring-offset-2" : ""
                                                        )}
                                                        style={{
                                                            backgroundColor: `${slot.subject?.color} 15`,
                                                            borderColor: `${slot.subject?.color} 40`,
                                                            borderLeftWidth: '4px',
                                                            borderLeftColor: slot.subject?.color
                                                        }}
                                                    >
                                                        {/* Slot Decoration */}
                                                        {config.slotDecoration === 'striped' && (
                                                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_50%,currentColor_50%,currentColor_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                                                        )}

                                                        <div className="flex justify-between items-start relative z-10">
                                                            <div>
                                                                <h4 className="font-semibold text-sm" style={{ color: slot.subject?.color }}>
                                                                    {slot.subject?.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border",
                                                                        slot.subject?.priority === 'High' ? "bg-red-100 text-red-700 border-red-200" :
                                                                            slot.subject?.priority === 'Medium' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                                "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                    )}>
                                                                        {slot.subject?.priority}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {config.focusMode} mode
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Duration badge if needed */}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* --- TOAST NOTIFICATION --- */}
            {toast && (
                <div className={cn(
                    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5 fade-in duration-300",
                    toast.type === 'error' ? "bg-destructive text-destructive-foreground border-destructive/50" :
                        "bg-foreground text-background border-border"
                )}>
                    {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
            )}

        </div>
    );
}
