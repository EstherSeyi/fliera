import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useParams } from "react-router-dom";

import { useGetEventDetails } from "../hooks/queries/useGetEventDetails";
import type { Event } from "../types";

type EventDetailContextType = {
  userPhoto: File | null;
  setUserPhoto: React.Dispatch<React.SetStateAction<File | null>>;
  userPhotoPreview: string | null;
  setUserPhotoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  userImage: HTMLImageElement | null;
  setUserImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>;
  containerRef: React.RefObject<HTMLDivElement>;
  error: string | null;
  getEventError: { message: string } | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  userTextInputs: string[];
  setUserTextInputs: React.Dispatch<React.SetStateAction<string[]>>;
  event: Event | undefined;
  isLoading: boolean;
};

const EventDetailContext = createContext<EventDetailContextType | undefined>(
  undefined
);

export const useEventDetailContext = () => {
  const context = useContext(EventDetailContext);
  if (!context) {
    throw new Error(
      "useEventDetailContext must be used within an EventDetailProvider"
    );
  }
  return context;
};

export const EventDetailProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { id } = useParams<{ id: string }>();

  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    event,
    userTextInputs,
    setUserTextInputs,
    isLoading,
    error: getEventError,
  } = useGetEventDetails(id);

  // Load user image when photo preview changes
  useEffect(() => {
    if (!userPhotoPreview) {
      setUserImage(null);
      return;
    }

    const loadUserImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = userPhotoPreview;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        setUserImage(img);
      } catch (err) {
        console.error("Error loading user image:", err);
      }
    };

    loadUserImage();
  }, [userPhotoPreview]);

  return (
    <EventDetailContext.Provider
      value={{
        userPhoto,
        setUserPhoto,
        userPhotoPreview,
        setUserPhotoPreview,
        userImage,
        setUserImage,
        containerRef,
        error,
        setError,
        event,
        userTextInputs,
        setUserTextInputs,
        isLoading,
        getEventError,
      }}
    >
      {children}
    </EventDetailContext.Provider>
  );
};
