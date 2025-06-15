import React from "react";
import { Share2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { SocialShareButtons } from "./SocialShareButtons";
import type { GeneratedDP } from "../types";

interface ShareDPModalProps {
  isOpen: boolean;
  onClose: () => void;
  dp: GeneratedDP | null;
}

export const ShareDPModal: React.FC<ShareDPModalProps> = ({
  isOpen,
  onClose,
  dp,
}) => {
  if (!dp) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-primary">
            <Share2 className="w-5 h-5 mr-2" />
            Share Your DP
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* DP Preview */}
          <div className="text-center">
            <div className="inline-block rounded-lg overflow-hidden shadow-lg">
              <img
                src={dp.generated_image_url}
                alt={`DP for ${dp.event?.title || "event"}`}
                className="w-48 h-48 object-cover"
              />
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-primary">
                {dp.event?.title || "Event DP"}
              </h3>
              <p className="text-sm text-secondary">
                Created on {new Date(dp.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Social Share Buttons */}
          <SocialShareButtons
            imageUrl={dp.generated_image_url}
            title={dp.event?.title || "Event DP"}
            description={
              dp.user_text_inputs?.join(", ") ||
              "Check out my personalized event DP!"
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
