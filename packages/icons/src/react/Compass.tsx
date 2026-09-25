import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const Compass: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} /><path
		d="M10 14L15 9L14 10L9 15L10 14Z"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
  </svg>
);

Compass.displayName = "Compass";
