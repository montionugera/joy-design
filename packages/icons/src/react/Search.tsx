import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Search: React.FC<IconProps> = ({
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
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} /><path
		d="M16 16L20 20"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/>
  </svg>
);

Search.displayName = "Search";
