import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft, Clock, Calendar, Zap, Coffee,
    Brain, Sparkles, RotateCcw, Download, Copy,
    Plus, Trash2, GripVertical, Palette, List, Columns, Save
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

    // --- Render Helpers ---
    const currentTheme = THEMES[config.theme];

    return (
        <div className={cn("min-h-screen flex flex-col font-sans transition-colors duration-500", currentTheme.bg, config.theme === 'neon' || config.theme === 'dark' ? 'dark' : '')}>

            {/* --- HEADER --- */}
            <header className="h-16 border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 bg-background/50">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-primary-foreground shadow-lg animate-pulse-slow">
                        <Sparkles className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">AI-Powered Productivity</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Generator v2.0</p>
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
                        <Button size="lg" className="w-full shadow-lg hover:shadow-primary/20 transition-all font-semibold text-md animate-bounce-subtle">
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Schedule
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Copy className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Save className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    {/* Preview Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center">

                        <div className={cn(
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
                                {/* Time slots simulation */}
                                {['09:00', '10:00', '11:00', '12:00', '01:00', '02:00'].map((time, i) => {
                                    // Mock assigning subjects to slots
                                    const mockSubject = subjects[i % subjects.length];
                                    const isBreak = i === 2; // Fixed break index for preview

                                    return (
                                        <div key={time} className="flex gap-4 group">
                                            <div className="w-16 text-right text-xs text-muted-foreground font-mono pt-2">{time}</div>
                                            <div className="relative flex-1">
                                                {isBreak ? (
                                                    <div className="h-10 w-full border-dashed border-2 border-muted-foreground/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                                                        <Coffee className="w-3 h-3 mr-2" /> Short Break
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            "h-24 w-full rounded-xl p-3 border transition-all hover:scale-[1.01] hover:shadow-lg relative overflow-hidden",
                                                            hoveredSubjectId === mockSubject?.id ? "ring-2 ring-primary ring-offset-2" : ""
                                                        )}
                                                        style={{
                                                            backgroundColor: `${mockSubject?.color} 15`,
                                                            borderColor: `${mockSubject?.color} 40`,
                                                            borderLeftWidth: '4px',
                                                            borderLeftColor: mockSubject?.color
                                                        }}
                                                    >
                                                        {/* Slot Decoration */}
                                                        {config.slotDecoration === 'striped' && (
                                                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_50%,currentColor_50%,currentColor_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                                                        )}

                                                        <div className="flex justify-between items-start relative z-10">
                                                            <div>
                                                                <h4 className="font-semibold text-sm" style={{ color: mockSubject?.color }}>
                                                                    {mockSubject?.name || 'Untitled Subject'}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border",
                                                                        mockSubject?.priority === 'High' ? "bg-red-100 text-red-700 border-red-200" :
                                                                            mockSubject?.priority === 'Medium' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                                                "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                                    )}>
                                                                        {mockSubject?.priority}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {config.focusMode} mode
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {mockSubject?.targetHours > 1 && (
                                                                <div className="bg-background/50 rounded-full p-1">
                                                                    <RotateCcw className="w-3 h-3 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Floating Action Button (FAB) Simulation for effect */}
                            <div className="absolute bottom-6 right-6">
                                <div className="w-12 h-12 bg-primary rounded-full shadow-xl shadow-primary/30 flex items-center justify-center animate-bounce-slow text-primary-foreground">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
