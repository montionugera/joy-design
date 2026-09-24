import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const FaceMeh: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><path
		d="M8.5 15H15.5"
		stroke={color}
		strokeWidth="1.5"
		strokeLinecap="round"
	/><circle cx="9" cy="10" r="1.2" fill={color} /><circle cx="15" cy="10" r="1.2" fill={color} />
  </svg>
);

FaceMeh.displayName = "FaceMeh";
