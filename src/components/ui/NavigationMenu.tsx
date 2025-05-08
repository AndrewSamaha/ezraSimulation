'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

const NavigationMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle menu item clicks
  const handleMenuItemClick = () => {
    // Close menu after navigation
    setMenuOpen(false);
  };

  // Listen for clicks outside the menu to close it
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    // Add event listener with a small delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    // Clean up event listener
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="mt-2" ref={menuRef}>
      {/* Hamburger Menu Button */}
      <button
        className="cursor-pointer pl-9 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <Menu color="#ffffff" size={24} />
      </button>

      {/* Navigation Menu */}
      {menuOpen && (
        <div className="mt-2 py-2 px-4 bg-white dark:bg-slate-800 rounded shadow-lg z-10">
          <ul>
            <li className="mb-2">
              <Link
                href="/simulation"
                className="text-gray-800 dark:text-white hover:text-blue-500 font-medium block py-1 px-2"
                onClick={() => handleMenuItemClick()}
              >
                Simulation
              </Link>
            </li>
            <li>
              <Link
                href="/simulation/history"
                className="text-gray-800 dark:text-white hover:text-blue-500 font-medium block py-1 px-2"
                onClick={() => handleMenuItemClick()}
              >
                History
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavigationMenu;
