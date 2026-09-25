import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const MyPublish: React.FC<IconProps> = ({
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
		d="M10 6H18V18H10"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
	/><circle cx="6" cy="10" r="2" stroke={color} strokeWidth={strokeWidth} /><path
		d="M3 16C3 14.3431 4.34315 13 6 13H8C8.55228 13 9 13.4477 9 14V16"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/>
  </svg>
);

MyPublish.displayName = "MyPublish";
