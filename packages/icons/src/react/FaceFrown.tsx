import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const FaceFrown: React.FC<IconProps> = ({
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
		d="M8.5 16.5C8.5 16.5 10 14.5 12 14.5C14 14.5 15.5 16.5 15.5 16.5"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/><circle cx="9" cy="10" r="1.2" fill={color} /><circle cx="15" cy="10" r="1.2" fill={color} />
  </svg>
);

FaceFrown.displayName = "FaceFrown";
