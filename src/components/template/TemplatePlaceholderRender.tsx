import { Image as KonvaImage, Text, Group } from "react-konva";
import { transformText } from "../../lib/utils";
import { TemplateInputValues, TemplatePlaceholder } from "../../types";

interface Props {
  placeholder: TemplatePlaceholder;
  userImages: {
    [key: string]: HTMLImageElement;
  };
  imageScale: number;
  inputValues: TemplateInputValues;
}

export const TemplatePlaceholderRender = ({
  placeholder,
  userImages,
  imageScale,
  inputValues,
}: Props) => {
  // Scale coordinates for display on the Konva stage
  const scaledX = placeholder.x * imageScale;
  const scaledY = placeholder.y * imageScale;
  const scaledWidth = placeholder.width * imageScale;
  const scaledHeight = placeholder.height * imageScale;

  if (placeholder.type === "image") {
    const userImage = userImages[placeholder.id];
    if (!userImage) return null;

    // Calculate object-fit: cover scaling
    const imageAspectRatio = userImage.width / userImage.height;
    const placeholderAspectRatio = placeholder.width / placeholder.height;

    let cropX = 0;
    let cropY = 0;
    let cropWidth = userImage.width;
    let cropHeight = userImage.height;

    if (imageAspectRatio > placeholderAspectRatio) {
      cropWidth = userImage.height * placeholderAspectRatio;
      cropX = (userImage.width - cropWidth) / 2;
    } else {
      cropHeight = userImage.width / placeholderAspectRatio;
      cropY = (userImage.height - cropHeight) / 2;
    }

    // Use Group with clipFunc for proper shape clipping
    return (
      <Group
        x={scaledX}
        y={scaledY}
        clipFunc={(ctx) => {
          // Create clipping path based on shape
          if (placeholder.holeShape === "circle") {
            const radius = Math.min(scaledWidth, scaledHeight) / 2;
            ctx.beginPath();
            ctx.arc(scaledWidth / 2, scaledHeight / 2, radius, 0, Math.PI * 2);
            ctx.closePath();
          } else {
            // Default to rectangle
            ctx.beginPath();
            ctx.rect(0, 0, scaledWidth, scaledHeight);
            ctx.closePath();
          }
        }}
      >
        <KonvaImage
          image={userImage}
          width={scaledWidth}
          height={scaledHeight}
          crop={{
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
          }}
        />
      </Group>
    );
  } else {
    const textValue = inputValues[placeholder.id] as string;
    if (!textValue) return null;

    // Apply text transform
    const displayText = transformText(
      textValue,
      placeholder.textTransform ?? ""
    );

    // Ensure all text properties are properly scaled
    return (
      <Text
        key={placeholder.id}
        x={scaledX}
        y={scaledY}
        width={scaledWidth}
        height={scaledHeight}
        text={displayText}
        fontSize={placeholder.fontSize * imageScale}
        fill={placeholder.color || "#000000"}
        align={placeholder.textAlign || "center"}
        fontFamily={placeholder.fontFamily || "Open Sans"}
        fontStyle={placeholder.fontStyle || "normal"}
        wrap="word"
        ellipsis={true}
      />
    );
  }
};