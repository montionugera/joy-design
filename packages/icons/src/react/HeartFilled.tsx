import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const HeartFilled: React.FC<IconProps> = ({
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
		d="M12 20L10.5 18.5C5.4 13.9 2 10.8 2 7.5C2 4.4 4.4 2 7.5 2C9.2 2 10.9 2.8 12 4C13.1 2.8 14.8 2 16.5 2C19.6 2 22 4.4 22 7.5C22 10.8 18.6 13.9 13.5 18.5L12 20Z"
		fill=color
	/>
  </svg>
);

HeartFilled.displayName = "HeartFilled";
