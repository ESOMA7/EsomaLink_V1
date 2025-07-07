
import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />
);

export const DashboardViewSkeleton: React.FC = () => (
    <div>
        <Skeleton className="h-9 w-3/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
        </div>
        <div className="mt-12 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <Skeleton className="h-7 w-1/3 mb-6" />
            <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="text-right">
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const TableViewSkeleton: React.FC = () => (
    <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <div className="bg-slate-50 dark:bg-slate-700">
            <div className="flex px-6 py-3">
                {[...Array(5)].map((_, i) => (
                     <Skeleton key={i} className="h-4 w-24 mr-6" />
                ))}
            </div>
        </div>
        <div className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 w-full">
                    <Skeleton className="h-10 w-1/6" />
                    <Skeleton className="h-10 w-2/6" />
                    <Skeleton className="h-10 w-1/6" />
                    <Skeleton className="h-10 w-1/6" />
                    <Skeleton className="h-10 w-1/6" />
                </div>
            ))}
        </div>
    </div>
);

export const CalendarViewSkeleton: React.FC = () => (
     <div className="h-full flex flex-col">
        <div className="grid grid-cols-7">
            {[...Array(7)].map((_, i) => (
                <div key={i} className="text-center pb-2 border-b border-slate-200 dark:border-slate-700"><Skeleton className="h-5 w-8 mx-auto" /></div>
            ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-5 flex-grow gap-px bg-slate-200 dark:bg-slate-700">
            {[...Array(35)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-1 flex flex-col">
                    <Skeleton className="h-4 w-6 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            ))}
        </div>
    </div>
);

export const NotesViewSkeleton: React.FC = () => (
     <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Left Pane */}
        <div className="w-full md:w-1/3 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 space-y-4">
             <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="overflow-y-auto flex-grow space-y-2 pt-2">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                 ))}
            </div>
        </div>
        {/* Right Pane */}
        <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
             <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
             </div>
             <div className="flex-grow pt-4 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-full" />
             </div>
        </div>
     </div>
);
