import { useEffect } from "react";
import { renderCanvas } from "@/components/ui/canvas"
import { Shapes, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
    useEffect(() => {
        renderCanvas();
    }, []);

    return (
        <section id="home" className="relative w-full h-screen overflow-hidden bg-background text-foreground">
            <div className="animation-delay-8 animate-fadeIn mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-8 relative z-10">
                <div className="z-10 mb-6 mt-10 sm:justify-center md:mb-4 md:mt-20">
                    <div className="relative flex items-center whitespace-nowrap rounded-full border bg-popover px-3 py-1 text-xs leading-6 text-primary/60">
                        <Shapes className="h-5 p-1" /> Introducing SmartSlot.
                        <a
                            href="#"
                            rel="noreferrer"
                            className="hover:text-ali ml-1 flex items-center font-semibold"
                        >
                            <div className="absolute inset-0 flex" aria-hidden="true" />
                            Explore{" "}
                            <span aria-hidden="true">
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </a>
                    </div>
                </div>

                <div className="mb-10 mt-4 md:mt-6">
                    <div className="px-2">
                        <div className="border-ali relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20">
                            <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                                <Plus
                                    strokeWidth={4}
                                    className="text-ali absolute -left-5 -top-5 h-10 w-10"
                                />
                                <Plus
                                    strokeWidth={4}
                                    className="text-ali absolute -bottom-5 -left-5 h-10 w-10"
                                />
                                <Plus
                                    strokeWidth={4}
                                    className="text-ali absolute -right-5 -top-5 h-10 w-10"
                                />
                                <Plus
                                    strokeWidth={4}
                                    className="text-ali absolute -bottom-5 -right-5 h-10 w-10"
                                />
                                AI-Powered Productivity Table Generator
                            </h1>
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <span className="relative flex h-3 w-3 items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                </span>
                                <p className="text-xs text-green-500">Ready to Generate</p>
                            </div>
                        </div>
                    </div>

                    <h1 className="mt-8 text-2xl md:text-2xl">
                        Generate intelligent tables <span className="text-ali font-bold">instantly.</span>
                    </h1>

                    <p className="md:text-md mx-auto mb-16 mt-2 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
                        Transform your data into organized, productive tables with the power of AI.
                    </p>

                </div>
            </div>
            <canvas
                className="bg-skin-base pointer-events-none absolute inset-0 mx-auto"
                id="canvas"
            ></canvas>
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50">
                <Link to="/start">
                    <Button variant="default" size="lg" className="shadow-lg hover:scale-105 transition-transform">
                        Start
                    </Button>
                </Link>
            </div>
        </section>
    );
};
