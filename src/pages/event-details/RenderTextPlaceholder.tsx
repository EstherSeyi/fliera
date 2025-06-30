import { Text } from "react-konva";

import { transformText } from "../../lib/utils";
import { useEventDetailContext } from "../../context/EventDetails";

interface Props {
  imageScale: number;
}

export const RenderTextPlaceholders = ({ imageScale }: Props) => {
  const { event, userTextInputs } = useEventDetailContext();

  if (!event || userTextInputs.length === 0) return null;

  return event.text_placeholders.map((placeholder, index) => {
    const {
      x,
      y,
      width,
      height,
      fontSize,
      color,
      textAlign,
      fontFamily,
      fontStyle,
      textTransform,
    } = placeholder;

    // Get the user input for this placeholder
    const userInput = userTextInputs[index] || "";
    if (!userInput.trim()) return null;

    // Transform the text according to textTransform
    const displayText = transformText(userInput, textTransform ?? "");

    return (
      <Text
        key={index}
        x={x * imageScale}
        y={y * imageScale}
        width={width * imageScale}
        height={height * imageScale}
        text={displayText}
        fontSize={fontSize * imageScale}
        fill={color}
        align={textAlign}
        fontFamily={fontFamily}
        fontStyle={fontStyle}
        wrap="word"
        ellipsis={true}
      />
    );
  });
};
