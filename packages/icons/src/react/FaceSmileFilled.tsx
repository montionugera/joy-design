import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const FaceSmileFilled: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="10" fill=color /><path
		d="M8.5 14.5C8.5 14.5 10 16.5 12 16.5C14 16.5 15.5 14.5 15.5 14.5"
		stroke="var(--bg-canvas)"
		strokeWidth="1.5"
		strokeLinecap="round"
	/><circle cx="9" cy="10" r="1.2" fill="var(--bg-canvas)" /><circle
		cx="15"
		cy="10"
		r="1.2"
		fill="var(--bg-canvas)"
	/>
  </svg>
);

FaceSmileFilled.displayName = "FaceSmileFilled";
