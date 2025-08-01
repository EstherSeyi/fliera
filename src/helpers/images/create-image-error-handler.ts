type HandleImageErrorParams = {
  fallbackSrc: string;
  removeContainerClasses?: string[];
  addImgClasses?: string[];
  removeImgClasses?: string[];
};

export const createImageErrorHandler = ({
  fallbackSrc,
  removeContainerClasses = ["animate-pulse", "bg-gray-200"],
  removeImgClasses = ["opacity-0"],
  addImgClasses = ["opacity-100"],
}: HandleImageErrorParams) => {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;

    img.src = fallbackSrc;

    if (container) {
      container.classList.remove(...removeContainerClasses);
    }

    img.classList.remove(...removeImgClasses);
    img.classList.add(...addImgClasses);
  };
};

type HandleImageLoadParams = {
  removeContainerClasses?: string[];
  removeImgClasses?: string[];
  addImgClasses?: string[];
};

export const createImageLoadHandler = ({
  removeContainerClasses = ["animate-pulse", "bg-gray-200"],
  removeImgClasses = ["opacity-0"],
  addImgClasses = ["opacity-100"],
}: HandleImageLoadParams = {}) => {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;

    if (container) {
      container.classList.remove(...removeContainerClasses);
    }

    img.classList.remove(...removeImgClasses);
    img.classList.add(...addImgClasses);
  };
};
