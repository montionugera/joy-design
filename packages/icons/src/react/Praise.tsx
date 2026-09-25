import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Praise: React.FC<IconProps> = ({
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
    <path
		d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 13.9103 20.4045 15.6811 19.3871 17.1517L20.5 20.5L17.1517 19.3871C15.6811 20.4045 13.9103 21 12 21Z"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinejoin="round"
	/><path
		d="M8 12C8 12 9.5 14 12 14C14.5 14 16 12 16 12"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/><path
		d="M8.5 9.5C8.5 8.5 9.5 8.5 9.5 9.5"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/><path
		d="M14.5 9.5C14.5 8.5 15.5 8.5 15.5 9.5"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/>
  </svg>
);

Praise.displayName = "Praise";
