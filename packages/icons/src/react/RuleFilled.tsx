import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const RuleFilled: React.FC<IconProps> = ({
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
    <path d="M12 3L4 6V11C4 16.5 12 21 12 21C12 21 20 16.5 20 11V6L12 3Z" fill=color /><path
		d="M8 12H16"
		stroke="var(--bg-canvas)"
		strokeWidth="1.5"
		strokeLinecap="round"
	/>
  </svg>
);

RuleFilled.displayName = "RuleFilled";
