import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const LockOpenFilled: React.FC<IconProps> = ({
  size = "1em",
  color = "currentColor",
  strokeWidth = 1.5,
  className = "",
  style = {},
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true" focusable="false" style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <rect x="5" y="10" width="14" height="10" rx="2" fill={color} /><path
		d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/>
  </svg>
);

LockOpenFilled.displayName = "LockOpenFilled";
