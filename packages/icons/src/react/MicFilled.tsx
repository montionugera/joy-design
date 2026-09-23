import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
  color?: string;
  strokeWidth?: number;
}

export const MicFilled: React.FC<IconProps> = ({
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
    <rect x="9" y="3" width="6" height="10" rx="3" fill={color} /><path
		d="M5 11V13C5 16.866 8.13401 20 12 20C15.866 20 19 16.866 19 13V11M12 20V23"
		stroke={color}
		strokeWidth="1.5"
		strokeLinecap="round"
	/>
  </svg>
);

MicFilled.displayName = "MicFilled";
