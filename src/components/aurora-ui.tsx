import Aurora from '@/components/ui/Aurora';

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <Aurora
        colorStops={["#FFBC8F", "#E58A80", "#CC5BF5"]}
        blend={0.6}
        amplitude={0.5}
        speed={0.7}
      />
    </div>
  );
}

export default AuroraBackground;
