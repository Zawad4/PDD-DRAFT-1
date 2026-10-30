import React from 'react';

export default function Footer({ onOpenSupport }) {
  return (
    <footer className="py-8 bg-[#040404] border-t border-white/5 text-center text-xs text-neutral-500 font-light pb-28 xl:pb-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Turfington Platform. Made in India 🇮🇳</p>
        <div className="flex space-x-4 items-center">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
          <button
            type="button"
            onClick={onOpenSupport}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Support
          </button>
        </div>
      </div>
    </footer>
  );
}

