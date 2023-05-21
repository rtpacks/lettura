import React from "react";

export interface PanelProps {
  title: string;
  subTitle?: string;
  children?: React.ReactNode;
}

export const Panel = (props: PanelProps) => {
  const { title, subTitle, children } = props;

  return (
    <div className="">
      <div className="mb-5">
        <h3 className="text-lg font-medium tracking-tight">{title}</h3>
        {subTitle && <p className="text-sm mb-3 mt-2 text-[hsl(var(--foreground)_/_0.6)]">{subTitle}</p>}
      </div>
      {children}
    </div>
  );
};

export interface PanelSectionProps extends PanelProps {}

export const PanelSection = (props: PanelSectionProps) => {
  const { title, subTitle, children } = props;

  return (
    <div className="flex items-center justify-between pb-4 mb-6 mt-4 border-b">
      <div>
        <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{title}</h3>
        {subTitle && <p className="text-sm mb-2 text-[hsl(var(--foreground)_/_0.6)]">{subTitle}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
};