'use client'
import { useState, useEffect } from 'react';
import { ChevronRight, Zap, AlertCircle, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';

export default function UserJourney() {
    const [activeStep, setActiveStep] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    const steps = [
        { label: 'Agent Runs', icon: Zap, color: 'from-blue-500 to-blue-600' },
        { label: 'Alert Generated', icon: AlertCircle, color: 'from-amber-500 to-amber-600' },
        { label: 'Click Alert', icon: ChevronRight, color: 'from-purple-500 to-purple-600' },
        { label: 'See Explanation', icon: Lightbulb, color: 'from-green-500 to-green-600' },
    ];

    useEffect(() => {
        if (!isAutoPlay) return;

        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 2000);

        return () => clearInterval(timer);
    }, [isAutoPlay, steps.length]);

    const handleStepClick = (index: number) => {
        setActiveStep(index);
        setIsAutoPlay(false);
    };

    return (
        <section className="px-6 py-16 border-t border-gray-200">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">User Journey</h2>
                <p className="text-gray-600 mb-12">Watch how users interact with alerts</p>

                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = activeStep === index;
                            const isPassed = index < activeStep;

                            return (
                                <div key={step.label} className="flex-1 w-full md:w-auto">
                                    <Button variant='outline'
                                        onClick={() => handleStepClick(index)}
                                        className="w-full group relative"
                                    >
                                        <div
                                            className={`relative rounded-xl p-6 transition-all duration-500 cursor-pointer border-2 transform ${isActive ? `border-transparent bg-linear-to-r ${step.color} shadow-lg scale-105` : isPassed ? 'border-gray-300 bg-gray-50 scale-100' : 'border-gray-200 bg-white hover:border-gray-300 scale-100'}`}
                                        >
                                            {/* Animated glow background for active step */}
                                            {isActive && (
                                                <div
                                                    className={`absolute inset-0 bg-linear-to-r ${step.color} rounded-xl opacity-0 blur-xl animate-pulse`}
                                                />
                                            )}

                                            {/* Content */}
                                            <div className="relative flex items-center justify-center gap-2">
                                                <Icon
                                                    size={24}
                                                    className={`transition-all duration-500 ${isActive
                                                        ? 'text-white scale-110 animate-bounce'
                                                        : isPassed
                                                            ? 'text-green-600'
                                                            : 'text-gray-400 group-hover:text-gray-600'
                                                        }`}
                                                />
                                                <p
                                                    className={`font-semibold transition-all duration-500 ${isActive
                                                        ? 'text-white'
                                                        : isPassed
                                                            ? 'text-gray-700'
                                                            : 'text-gray-900'
                                                        }`}
                                                >
                                                    {step.label}
                                                </p>
                                            </div>

                                            {/* Checkmark for completed steps */}
                                            {isPassed && (
                                                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 animate-pulse">
                                                    <svg
                                                        className="w-4 h-4 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2">
                        {steps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleStepClick(index)}
                                className={`h-2 rounded-full transition-all duration-500 ${index === activeStep
                                    ? 'w-8 bg-linear-to-r from-blue-500 to-green-500'
                                    : index < activeStep
                                        ? 'w-6 bg-green-500'
                                        : 'w-2 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Auto-play toggle */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                        >
                            {isAutoPlay ? '⏸ Pause' : '▶ Auto-play'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}