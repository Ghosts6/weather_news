import React from 'react';

interface IconProps {
  className?: string;
  fill?: string;
}

const SunriseIcon: React.FC<IconProps> = ({ className, fill = 'currentColor' }) => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 32 32" xmlSpace="preserve" className={className} fill={fill}>
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M27,22.5c-0.87-0.83-2.27-0.83-3.14,0l0,0c-0.87,0.83-2.27,0.83-3.14,0l0,0c-0.87-0.83-2.27-0.83-3.14,0l0,0c-0.87,0.83-2.27,0.83-3.14,0l0,0c-0.87-0.83-2.27-0.83-3.14,0l0,0c-0.87,0.83-2.27,0.83-3.14,0"/>
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M29,26.5c-1.03-0.83-2.69-0.83-3.71,0l0,0c-1.03,0.83-2.69,0.83-3.71,0l0,0c-1.03-0.83-2.69-0.83-3.71,0l0,0c-1.03,0.83-2.69,0.83-3.71,0l0,0c-1.03-0.83-2.69,0.83-3.71,0l0,0c-1.03-0.83-2.69-0.83-3.71,0"/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="16" y1="3" x2="16" y2="6"/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="6.81" y1="6.81" x2="8.93" y2="8.93"/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="3" y1="16" x2="6" y2="16"/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="29" y1="16" x2="26" y2="16"/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="25.19" y1="6.81" x2="23.07" y2="8.93"/>
    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M22.32,19c0.43-0.91,0.68-1.92,0.68-3c0-3.87-3.13-7-7-7s-7,3.13-7,7c0,1.08,0.25,2.09,0.68,3"/>
    <polyline stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="13,15 16,12 19,15 "/>
    <line stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="16" y1="19" x2="16" y2="12"/>
  </svg>
);

export default SunriseIcon;
