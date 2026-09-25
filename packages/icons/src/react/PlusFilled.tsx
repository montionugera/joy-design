import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const PlusFilled: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="10" fill={color} /><path
		d="M12 7V17M7 12H17"
		stroke="var(--joy-surface-canvas)"
		strokeWidth={strokeWidth}
		strokeLinecap="round"
		strokeLinejoin="round"
	/>
  </svg>
);

PlusFilled.displayName = "PlusFilled";
