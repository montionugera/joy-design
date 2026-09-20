import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const Good: React.FC<IconProps> = ({
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
    <path
		d="M14 8V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5L9 10H5C3.89543 10 3 10.8954 3 12V18C3 19.1046 3.89543 20 5 20H15L19.2631 11.4737C19.7214 10.5571 19.0558 9.5 18.0315 9.5H14V8Z"
		stroke=color
		strokeWidth="1.5"
		strokeLinejoin="round"
	/><path d="M9 10V20" stroke=color strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

Good.displayName = "Good";
