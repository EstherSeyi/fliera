import { useEffect } from "react";
import WebFont from "webfontloader";
import { COMMON_EVENT_FONTS } from "../constants";

export const usePreloadGoogleFonts = () => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: COMMON_EVENT_FONTS,
      },
    });
  }, []);
};
