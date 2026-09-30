/**
 * Centered logo + wordmark for the login screen left panel (photo + overlays applied by parent).
 */
export const AuthLoginBrandPanel = () => (
  <div className="relative z-10 flex flex-col items-center text-center px-4">
    <div className="flex items-center justify-center rounded-[1.35rem] bg-white/95 shadow-2xl ring-2 ring-white/40 backdrop-blur-[2px] ">
      <img
        src="/oron-logo.svg"
        alt="Oron Care"
        className="h-[4.5rem] w-[4.5rem] rounded-[1.35rem] object-contain sm:h-[5rem] sm:w-[5rem]"
        width={80}
        height={80}
      />
    </div>

    <div className="mt-10 max-w-sm [text-shadow:0_2px_28px_rgba(0,0,0,0.55)]">
      <p className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
        ORON
        <span className="font-bold text-emerald-200"> Care</span>
      </p>
      <p className="mt-5 text-base font-medium leading-snug text-white/90 sm:text-lg">
        SeniorCare platform care management and operational intelligence
      </p>
    </div>
  </div>
);
