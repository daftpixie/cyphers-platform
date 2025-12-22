import Link from 'next/link';

// Helper component for the blinking cursor
const BlinkingCursor = () => (
  <span className="animate-blink text-cyan-400 ml-2">_</span>
);

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0B0E27] text-white">
      <div className="text-center p-8 border border-gray-700 bg-[#1A1D3A]/50 rounded-lg shadow-xl shadow-cyan-500/5">

        {/* Themed 404 Error Code */}
        <h1 className="font-orbitron text-7xl md:text-9xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(0,217,255,0.4)] flex items-center justify-center">
          404<BlinkingCursor />
        </h1>

        {/* Thematic Title */}
        <p className="font-space-grotesk text-xl md:text-2xl mt-4 text-gray-300">
          SIGNAL LOST // CONNECTION TERMINATED
        </p>

        {/* Descriptive Message */}
        <div className="mt-8 max-w-lg mx-auto">
          <p className="font-space-mono text-base text-gray-400">
            The resource you're seeking has been scrubbed, never existed, or is behind a firewall you can't breach. The signal is gone. Standard procedure is to return to a secure location.
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="mt-12">
          <Link
            href="/"
            className="font-space-grotesk inline-block rounded-md bg-cyan-500/10 px-8 py-3 text-lg font-bold text-cyan-400 border border-cyan-500/50 transition-all duration-300 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:border-cyan-400"
          >
            &gt; Re-establish Connection
          </Link>
        </div>

      </div>
    </main>
  );
}
