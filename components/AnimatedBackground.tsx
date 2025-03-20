import { ReactNode } from "react";

type AnimatedBackgroundProps = {
  children: ReactNode;
};

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-[#F9F9F9] overflow-hidden">
      {/* Animated Orange Circles */}
      <div className="absolute top-10 left-10 w-12 h-12 bg-orange-400 rounded-full opacity-80 animate-float1 z-0" />
      <div className="absolute top-1/3 left-[60%] w-8 h-8 bg-orange-300 rounded-full opacity-70 animate-float2 z-0" />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-orange-200 rounded-full opacity-80 animate-float1 z-0" />

      {/* Additional Objects */}
      <div className="absolute top-20 right-10 w-10 h-10 bg-orange-500 rounded-full opacity-75 animate-float2 z-0" />
      <div className="absolute bottom-10 right-20 w-12 h-12 bg-orange-300 rounded-full opacity-80 animate-float1 z-0" />
      <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-orange-400 rounded-full opacity-60 animate-float2 z-0" />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
