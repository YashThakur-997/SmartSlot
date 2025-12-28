import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function DataEntry() {
    const [tableType, setTableType] = useState("daily");

    return (
        <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>

                <div className="space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Configure Your Table
                        </h1>
                        <p className="text-muted-foreground">
                            Customize every detail to generate the perfect productivity tool.
                        </p>
                    </div>

                    <div className="grid gap-8">
                        {/* 1. Table Structure Inputs */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">1. Table Structure</h2>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Table Type</Label>
                                    <RadioGroup defaultValue="daily" onValueChange={setTableType} className="flex flex-col space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="daily" id="daily" />
                                            <Label htmlFor="daily">Daily</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="weekly" id="weekly" />
                                            <Label htmlFor="weekly">Weekly</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="monthly" id="monthly" />
                                            <Label htmlFor="monthly">Monthly</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="custom" id="custom" />
                                            <Label htmlFor="custom">Custom</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rows">Number of Rows (5-50)</Label>
                                    <Input type="number" id="rows" min={5} max={50} defaultValue={10} />
                                </div>

                                {tableType === "custom" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="columns">Number of Columns</Label>
                                        <Input type="number" id="columns" min={1} max={10} defaultValue={4} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Column Selection Inputs */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">2. Column Selection</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-task" defaultChecked disabled />
                                    <Label htmlFor="col-task">Task Name (Mandatory)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-time" defaultChecked />
                                    <Label htmlFor="col-time">Time Slot / Duration</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-priority" />
                                    <Label htmlFor="col-priority">Priority (Low/Med/High)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-status" />
                                    <Label htmlFor="col-status">Status (Pending/Done)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-notes" />
                                    <Label htmlFor="col-notes">Notes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-deadline" />
                                    <Label htmlFor="col-deadline">Deadline</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="col-category" />
                                    <Label htmlFor="col-category">Category/Subject</Label>
                                </div>
                            </div>
                        </div>

                        {/* 3. Autofill / Smart Features */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">3. Smart Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="smart-number" />
                                    <Label htmlFor="smart-number">Auto-number tasks</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="smart-time" />
                                    <Label htmlFor="smart-time">Auto-generate time blocks</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="smart-priority" />
                                    <Label htmlFor="smart-priority">Auto-fill priority</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="smart-color" />
                                    <Label htmlFor="smart-color">Auto-add color coding</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="smart-placeholder" defaultChecked />
                                    <Label htmlFor="smart-placeholder">Auto-generate placeholders</Label>
                                </div>
                            </div>
                        </div>

                        {/* 4. Styling & Display Options */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">4. Styling & Display</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select defaultValue="minimal">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="minimal">Minimal</SelectItem>
                                            <SelectItem value="bordered">Bordered</SelectItem>
                                            <SelectItem value="shaded">Shaded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Font Size</Label>
                                    <Select defaultValue="14px">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="12px">12px</SelectItem>
                                            <SelectItem value="14px">14px</SelectItem>
                                            <SelectItem value="16px">16px</SelectItem>
                                            <SelectItem value="18px">18px</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Cell Padding</Label>
                                    <Select defaultValue="8px">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select padding" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="4px">4px</SelectItem>
                                            <SelectItem value="6px">6px</SelectItem>
                                            <SelectItem value="8px">8px</SelectItem>
                                            <SelectItem value="12px">12px</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Color Accent</Label>
                                    <Select defaultValue="blue">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select accent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blue">Blue</SelectItem>
                                            <SelectItem value="purple">Purple</SelectItem>
                                            <SelectItem value="teal">Teal</SelectItem>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-4">
                                    <Switch id="dark-mode" />
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                </div>
                            </div>
                        </div>

                        {/* 5. Table Content Inputs */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">5. Manual Content (Optional)</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-tasks">Task Names List (one per line)</Label>
                                    <Textarea id="manual-tasks" placeholder="Task 1&#10;Task 2&#10;Task 3" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual-notes">Notes / Instructions</Label>
                                    <Textarea id="manual-notes" placeholder="Any specific instructions for the AI..." />
                                </div>
                            </div>
                        </div>

                        {/* 6. Export Options */}
                        <div className="space-y-4 border p-6 rounded-lg bg-card text-card-foreground shadow-sm">
                            <h2 className="text-xl font-semibold">6. Export Options</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="export-pdf" />
                                    <Label htmlFor="export-pdf">Export as PDF</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="export-png" />
                                    <Label htmlFor="export-png">Export as PNG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="export-html" />
                                    <Label htmlFor="export-html">Copy as HTML</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="export-md" />
                                    <Label htmlFor="export-md">Copy as Markdown</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="save-layout" defaultChecked />
                                    <Label htmlFor="save-layout">Save Layout (localStorage)</Label>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" size="lg">
                            Generate Table
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
