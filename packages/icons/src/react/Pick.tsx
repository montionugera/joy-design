import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Pick: React.FC<IconProps> = ({
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
    <path
		d="M11 11V3C11 2.44772 11.4477 2 12 2C12.5523 2 13 2.44772 13 3V11"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
	/><path
		d="M13 8H15C15.5523 8 16 8.44772 16 9V11"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
	/><path
		d="M16 10H18C18.5523 10 19 10.4477 19 11V15C19 18.3137 16.3137 21 13 21H11C8.79086 21 7 19.2091 7 17V12.5L9.5 11"
		stroke=color
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
  </svg>
);

Pick.displayName = "Pick";
