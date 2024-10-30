import { memo, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export const SetTextComment = memo(function SetTextComment({
  isSelect,
}: {
  isSelect: boolean;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isSelect) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.formatText("highlight");
          console.log(selection.getStartEndPoints());
        }
      });
    }
  }, [isSelect]);

  return <></>;
});
