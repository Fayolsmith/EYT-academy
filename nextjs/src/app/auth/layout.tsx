import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const parentTestimonials = [
        {
            quote: "Mrs Sarah transformed my son's reading confidence. In 6 weeks he mastered CVC words and phonics sounds!",
            author: "Mrs Elizabeth Adeleke",
            role: "Parent of Leo (Age 5)",
            avatar: "EA"
        },
        {
            quote: "The personalized Montessori pacing and warm feedback helped my daughter thrive in preschool numeracy.",
            author: "Dr Kemi Ogunleye",
            role: "Parent of Tobi (Age 4)",
            avatar: "KO"
        },
        {
            quote: "Interactive online sessions that keep my child thoroughly focused. The milestone tracker is amazing.",
            author: "Mr Chukwuma Eze",
            role: "Parent of Chisom (Age 6)",
            avatar: "CE"
        }
    ];

    return (
        <div className="flex min-h-screen">
            {/* Form side */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white relative">
                <Link
                    href="/"
                    className="absolute left-8 top-8 flex items-center text-sm font-semibold text-[#1E4E8C] hover:text-[#153763] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 text-[#D4A017]" />
                    Back to Homepage
                </Link>

                <div className="sm:mx-auto sm:w-full sm:max-w-md pt-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1E4E8C] flex items-center justify-center text-white border-2 border-[#D4A017] shadow-md">
                            <BookOpen className="w-7 h-7 text-[#D4A017]" />
                        </div>
                    </div>
                    <h2 className="text-center text-2xl sm:text-3xl font-heading font-bold tracking-tight text-[#1E4E8C]">
                        Mrs Sarah Tutoring
                    </h2>
                    <p className="text-center text-xs text-[#6B7280] mt-1 font-medium">
                        Montessori & British Curriculum (Ages 3–8)
                    </p>
                </div>

                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                    {children}
                </div>
            </div>

            {/* Right side banner */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E4E8C] to-[#153763] text-white">
                <div className="w-full flex items-center justify-center p-12">
                    <div className="space-y-6 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#D4A017] border border-[#D4A017]/30">
                            <Sparkles className="w-3.5 h-3.5" />
                            Guardian & Parent Portal
                        </div>
                        <h3 className="font-heading text-3xl font-bold mb-6 text-white leading-tight">
                            Track your child&apos;s learning journey and book sessions seamlessly.
                        </h3>
                        {parentTestimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="relative bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/15 shadow-md"
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center text-[#14263F] font-bold text-xs shadow">
                                            {testimonial.avatar}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-blue-50 leading-relaxed italic">
                                            &ldquo;{testimonial.quote}&rdquo;
                                        </p>
                                        <div className="mt-2 text-xs font-bold text-white">
                                            {testimonial.author}
                                            <span className="text-[11px] font-normal text-blue-200 block">
                                                {testimonial.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}