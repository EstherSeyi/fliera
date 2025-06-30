import { Image as KonvaImage, Group } from "react-konva";

import { useEventDetailContext } from "../../context/EventDetails";

interface Props {
  imageScale: number;
  userImage: HTMLImageElement | null;
}

export const RenderImagePlaceholder = ({ imageScale, userImage }: Props) => {
  const { event } = useEventDetailContext();

  if (!event || !userImage) return null;

  const imagePlaceholder = event.image_placeholders[0];
  if (!imagePlaceholder) return null;

  const { x, y, width, height, holeShape } = imagePlaceholder;

  // Scale coordinates for display on the Konva stage
  const scaledX = x * imageScale;
  const scaledY = y * imageScale;
  const scaledWidth = width * imageScale;
  const scaledHeight = height * imageScale;

  // Calculate object-fit: cover scaling and positioning
  const imageAspectRatio = userImage.width / userImage.height;
  const placeholderAspectRatio = width / height;

  let cropX = 0;
  let cropY = 0;
  let cropWidth = userImage.width;
  let cropHeight = userImage.height;

  if (imageAspectRatio > placeholderAspectRatio) {
    // Image is wider than placeholder - crop horizontally
    cropWidth = userImage.height * placeholderAspectRatio;
    cropX = (userImage.width - cropWidth) / 2;
  } else {
    // Image is taller than placeholder - crop vertically
    cropHeight = userImage.width / placeholderAspectRatio;
    cropY = (userImage.height - cropHeight) / 2;
  }

  const radius = Math.min(scaledWidth, scaledHeight) / 2;

  const groupX = holeShape === "circle" ? scaledX - radius : scaledX;
  const groupY = holeShape === "circle" ? scaledY - radius : scaledY;

  return (
    <Group
      x={groupX}
      y={groupY}
      clipFunc={ctx => {
        ctx.beginPath();
        switch (holeShape) {
          case "circle": {
            const centerX = scaledWidth / 2; // Fixed: Center at middle of width
            const centerY = scaledHeight / 2; // Fixed: Center at middle of height
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            break;
          }
          case "triangle":
            ctx.moveTo(scaledWidth / 2, 0);
            ctx.lineTo(scaledWidth, scaledHeight);
            ctx.lineTo(0, scaledHeight);
            ctx.closePath();
            break;
          case "box":
          default:
            ctx.rect(0, 0, scaledWidth, scaledHeight);
            break;
        }
      }}
    >
      <KonvaImage
        image={userImage}
        x={0}
        y={0}
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
};
