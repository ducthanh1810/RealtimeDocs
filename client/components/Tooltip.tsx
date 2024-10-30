import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ToolTip({
  children,
  text,
  className,
}: {
  children: React.ReactNode;
  text: string;
  className: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={cn("", className)}>
          {children}
        </TooltipTrigger>
        <TooltipContent className=" rounded-sm border-0 backdrop-blur-0 bg-slate-700/50 text-white">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
