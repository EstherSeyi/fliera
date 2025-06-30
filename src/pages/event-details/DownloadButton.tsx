import { useEvents } from "../../context/EventContext";
import { useAuth } from "../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../context/ToastContext";
import type { Dispatch } from "react";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Download } from "lucide-react";
import { useEventDetailContext } from "../../context/EventDetails";
import { useGenerateDP } from "../../hooks/useGenerateDP";

interface Props {
  hasGeneratedDP: boolean;
  setHasGeneratedDP: Dispatch<React.SetStateAction<boolean>>;
  stageRef: React.RefObject<any>;
}

export const DownloadButton = ({
  hasGeneratedDP,
  setHasGeneratedDP,
  stageRef,
}: Props) => {
  const {
    userPhoto,
    setUserPhoto,
    userPhotoPreview,
    setUserPhotoPreview,
    setUserImage,
    event,
    setUserTextInputs,
    userTextInputs,
  } = useEventDetailContext();

  const { user } = useAuth();
  const { showToast } = useToast();

  const { handleDownload, isGenerating } = useGenerateDP(stageRef);
  const { saveGeneratedDP } = useEvents();

  const allTextInputsFilled = event?.text_placeholders.every(
    (_, index) => userTextInputs[index] && userTextInputs[index].trim() !== ""
  );
  const hasRequiredInputs = userPhotoPreview && allTextInputsFilled;

  // Define the mutation for downloading and saving the DP
  const downloadDPMutation = useMutation({
    mutationFn: async () => {
      const response = await handleDownload();

      if (user && userPhoto && response && event && response) {
        await saveGeneratedDP({
          event_id: event.id,
          user_text_inputs: userTextInputs,
          user_photo: userPhoto,
          generated_image_data: response,
        });
      }
    },

    onSuccess: () => {
      showToast(
        "Your DP has been successfully downloaded and saved!",
        "success"
      );
      // Only reset page state on successful download and save
      setTimeout(() => {
        resetPageState();
      }, 1000);
    },
    onError: (err: any) => {
      showToast(
        err.message || "Failed to save your DP. Please try again.",
        "error"
      );
    },
  });

  const resetPageState = () => {
    setUserPhoto(null);
    if (userPhotoPreview) {
      URL.revokeObjectURL(userPhotoPreview);
    }
    setUserPhotoPreview(null);
    setUserTextInputs(event?.text_placeholders.map(() => "") || []);
    setHasGeneratedDP(false);
    setUserImage(null);
  };

  return (
    <>
      {/* Loading spinner - only show when saving, not during typing/preview generation */}
      {downloadDPMutation?.isPending && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <LoadingSpinner size={32} />
        </div>
      )}
      <button
        onClick={() => downloadDPMutation?.mutate()}
        disabled={
          isGenerating || !hasRequiredInputs || downloadDPMutation?.isPending
        }
        className="w-full flex items-center justify-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {downloadDPMutation.isPending || isGenerating ? (
          <>
            <LoadingSpinner className="mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Download Your DP
          </>
        )}
      </button>

      {!hasRequiredInputs && (
        <p className="text-xs text-red-500 text-center">
          Please upload a photo and fill in all text fields to download your DP
        </p>
      )}

      {user && hasGeneratedDP && (
        <p className="text-xs text-gray-500 text-center">
          Your DP will be saved to your account when downloaded
        </p>
      )}
    </>
  );
};
