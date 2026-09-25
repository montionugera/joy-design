import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const ChevronRight: React.FC<IconProps> = ({
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
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

ChevronRight.displayName = "ChevronRight";
