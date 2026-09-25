import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const CameraFilled: React.FC<IconProps> = ({
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
    <rect x="4" y="7" width="16" height="12" rx="2" fill={color} /><path
		d="M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/><circle cx="12" cy="13" r="3" fill="var(--joy-surface-canvas)" />
  </svg>
);

CameraFilled.displayName = "CameraFilled";
