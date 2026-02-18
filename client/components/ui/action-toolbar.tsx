"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolbarButton {
  label: string;
  icon?: React.ReactNode;
  count?: number;
  onClick?: () => void;
  dropdownItems?: string[];
  active?: boolean;
}

interface ActionToolbarProps {
  buttons: ToolbarButton[];
  compact?: boolean;
  /** Use "sm" for tighter tabs (My Posts page, etc.) */
  size?: "default" | "sm";
  className?: string;
  /** Index of the currently active button (controlled mode) */
  activeIndex?: number;
  /** Called when a button is clicked (controlled mode) */
  onActiveChange?: (index: number) => void;
}

export function ActionToolbar({
  buttons,
  compact = false,
  size = "default",
  className = "",
  activeIndex,
  onActiveChange,
}: ActionToolbarProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={cn(
        "relative z-0 flex flex-wrap items-center border border-muted bg-linear-to-b from-background to-muted/30 shadow-sm",
        isSmall ? "gap-0.5 rounded-lg p-0.5" : "rounded-2xl p-1",
        className
      )}
    >
      {buttons.map((btn, index) => {
        const isActive = activeIndex !== undefined ? activeIndex === index : !!btn.active;

        const buttonClasses = cn(
          "flex items-center gap-1.5 transition-all duration-200",
          isSmall
            ? "px-2.5 h-7 rounded-md text-xs"
            : "px-3 h-9 rounded-xl",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted/80 hover:text-foreground text-muted-foreground"
        );

        const handleClick = () => {
          onActiveChange?.(index);
          btn.onClick?.();
        };

        if (btn.dropdownItems) {
          return (
            <div key={index} className="flex items-center">
              <Button
                onClick={handleClick}
                variant="ghost"
                className={cn(buttonClasses, compact && !isSmall && "px-2")}
              >
                {btn.icon}
                <span className={cn("font-medium", isSmall && "text-xs")}>{btn.label}</span>
                {btn.count !== undefined && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="text-xs font-mono -me-1"
                  >
                    {btn.count}
                  </Badge>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "ml-0.5 hover:bg-muted/80",
                      isSmall ? "h-7 w-6 rounded-md" : "h-9 w-8 rounded-xl"
                    )}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {btn.dropdownItems.map((item, i) => (
                    <DropdownMenuItem key={i} onClick={() => console.log(item)}>
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }

        return (
          <Button
            key={index}
            onClick={handleClick}
            variant="ghost"
            className={cn(buttonClasses, compact && !isSmall && "px-2")}
          >
            {btn.icon}
            <span className={cn("font-medium", isSmall && "text-xs")}>{btn.label}</span>
            {btn.count !== undefined && (
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="text-xs font-mono -me-1"
              >
                {btn.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
