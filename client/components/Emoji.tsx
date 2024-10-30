const emojiStyle = {
  "--epr-bg-color": "#101f3b",
  "--epr-category-label-bg-color": "#0b1527",
  scrollbarColor: "#1a305a #0f1c34",
} as React.CSSProperties;

import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import React from "react";

export const Emoji = ({
  EmojiHandle,
}: {
  EmojiHandle: (value: string) => void;
}) => {
  return (
    <EmojiPicker
      onEmojiClick={(emoji) => {
        EmojiHandle(emoji.emoji);
      }}
      emojiStyle={EmojiStyle.GOOGLE}
      searchDisabled={true}
      width={250}
      height={350}
      theme={Theme.AUTO}
      style={emojiStyle}
    />
  );
};
