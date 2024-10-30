import { memo, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export const UpdateStatePlugin = memo(function UpdateStatePlugin({
  State,
}: {
  State: string;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (State) {
      editor.update(() => {
        if (State) {
          try {
            const st = editor.getEditorState();
            if (JSON.stringify(st.toJSON()) != State) {
              const editorState = editor.parseEditorState(State);
              editor.setEditorState(editorState);
            }
          } catch {}
        }
      });
    }
  }, [State]);

  return <></>;
});
