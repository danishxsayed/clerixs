export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-[#0285F4] to-[#04E19E]" />
      {children}
    </div>
  );
}
