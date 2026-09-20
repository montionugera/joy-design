import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Publish: React.FC<IconProps> = ({
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
    aria-hidden="true" focusable="false" style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
		d="M13 14H6V4H14V7"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	/><path
		d="M10 9H19M19 9L16 6M19 9L16 12"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
  </svg>
);

Publish.displayName = "Publish";
