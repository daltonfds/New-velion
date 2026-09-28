import type { HTMLAttributes } from "react";

export default function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-gray-200 bg-white",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
