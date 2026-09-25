import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const FaceHappy: React.FC<IconProps> = ({
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
		d="M8 14H16C16 16.5 14 18 12 18C10 18 8 16.5 8 14Z"
		fill={color}
	/><path d="M9 10C9 9 10 9 10 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" /><path
		d="M14 10C14 9 15 9 15 10"
		stroke={color}
		strokeWidth={strokeWidth}
		strokeLinecap="round"
	/>
  </svg>
);

FaceHappy.displayName = "FaceHappy";
