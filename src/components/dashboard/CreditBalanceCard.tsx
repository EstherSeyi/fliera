import { CreditCard, Zap } from "lucide-react";
import { useUserCredits } from "../../hooks/useUserCredits";

export const CreditBalanceCard = ({ onClick }: { onClick: () => void }) => {
  const { creditInfo, loading } = useUserCredits();

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white/90 font-medium flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Credit Balance</span>
          </p>

          {loading ? (
            <div className="space-y-2 mt-2">
              <div className="h-8 bg-white/20 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mt-2">
                {creditInfo?.credits}
              </div>
              <p className="text-white/80 text-sm">
                {creditInfo?.is_premium_user ? "Premium Account" : "Free Tier"}{" "}
                • {creditInfo?.freeEventsRemaining ?? 0} free events left
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white/70">Click for details</span>
        </div>
      </div>

      {!loading && (
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">
              {creditInfo?.eventsCreated ?? 0}
            </div>
            <div className="text-xs text-white/70">Events Created</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {creditInfo?.totalDPsGenerated ?? 0}
            </div>
            <div className="text-xs text-white/70">DPs Generated</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              ${((creditInfo?.credits ?? 0) * 5).toFixed(0)}
            </div>
            <div className="text-xs text-white/70">Credit Value</div>
          </div>
        </div>
      )}
    </div>
  );
};
