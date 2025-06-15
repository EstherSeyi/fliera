import { Image as KonvaImage, Text } from "react-konva";
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

    return (
      <KonvaImage
        key={placeholder.id}
        image={userImage}
        x={scaledX}
        y={scaledY}
        width={scaledWidth}
        height={scaledHeight}
        crop={{
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight,
        }}
      />
    );
  } else {
    const textValue = inputValues[placeholder.id] as string;
    if (!textValue) return null;

    // Apply text transform
    const displayText = transformText(
      textValue,
      placeholder.textTransform ?? ""
    );

    return (
      <Text
        key={placeholder.id}
        x={placeholder.x}
        y={placeholder.y}
        width={placeholder.width}
        height={placeholder.height}
        text={displayText}
        fontSize={placeholder.fontSize || 24}
        fill={placeholder.color || "#ff0000"}
        align={placeholder.textAlign || "center"}
        fontFamily={placeholder.fontFamily || "Open Sans"}
        fontStyle={placeholder.fontStyle || "normal"}
        wrap="char"
        ellipsis={true}
      />
    );
  }
};
