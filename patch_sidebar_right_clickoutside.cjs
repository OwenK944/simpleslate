const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarRight.tsx', 'utf8');

// Add useRef and useEffect
if (!code.includes("useRef")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState, useRef, useEffect } from 'react';");
}

code = code.replace(
  "export function SidebarRight() {",
  `export function SidebarRight() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);`
);

code = code.replace(
  '<div className="relative" >',
  '<div className="relative" ref={dropdownRef}>'
);

// fix mt-1 back to mt-2 so it looks good, but since we use click outside, the gap doesn't cause it to close.
code = code.replace(
  "mt-1 w-full bg-slate-card",
  "mt-2 w-full bg-slate-card"
);

fs.writeFileSync('src/components/SidebarRight.tsx', code);
