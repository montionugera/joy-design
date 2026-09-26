import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const EmailFilled: React.FC<IconProps> = ({
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
    <path d="M4 7H20V17H4V7Z" fill={color} /><path
		d="M4 7L12 13L20 7"
		stroke="var(--joy-surface-canvas)"
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
  </svg>
);

EmailFilled.displayName = "EmailFilled";
