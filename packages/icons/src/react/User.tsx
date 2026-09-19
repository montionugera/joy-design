import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const User: React.FC<IconProps> = ({
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
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="12" cy="8" r="4" stroke=color strokeWidth="1.5" /><path
		d="M4 20C4 17.7909 7.58172 16 12 16C16.4183 16 20 17.7909 20 20"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
	/>
  </svg>
);

User.displayName = "User";
