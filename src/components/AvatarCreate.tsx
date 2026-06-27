"use client";

import {
  Camera,
  Check,
  ChevronLeft,
  ImagePlus,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { animatePetAvatar, generatePetAvatar } from "@/lib/gemini";
import type { Locale, PetAvatar } from "@/types";
import { AnimatedPetAvatar } from "./AnimatedPetAvatar";

type CreateStep = "select" | "camera" | "preview" | "generating" | "result";
type GenerationPhase = 1 | 2 | 3 | 4;
const generationSteps: Array<[string, GenerationPhase]> = [
  ["avatar.flowUpload", 1],
  ["avatar.flowAnalyze", 2],
  ["avatar.flowBuild", 3],
  ["avatar.flowReady", 4],
];

export function AvatarCreate({
  initialMode,
  locale,
  onClose,
  onComplete,
  t,
}: {
  initialMode: "upload" | "camera";
  locale: Locale;
  onClose: () => void;
  onComplete: (avatar: PetAvatar) => void;
  t: (key: string) => string;
}) {
  const [step, setStep] = useState<CreateStep>("select");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [avatar, setAvatar] = useState<PetAvatar | null>(null);
  const [generationPhase, setGenerationPhase] = useState<GenerationPhase>(1);
  const [generationError, setGenerationError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initialModeHandled = useRef(false);

  function stopCamera(updateState = true) {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (updateState) {
      setCameraStream(null);
      setCameraReady(false);
    }
  }

  useEffect(() => {
    if (initialMode === "camera" && !initialModeHandled.current) {
      initialModeHandled.current = true;
      void openCamera();
    }
  }, [initialMode]);

  useEffect(() => {
    if (step !== "camera" || !cameraStream || !videoRef.current) return;

    const video = videoRef.current;
    video.srcObject = cameraStream;
    const startVideo = async () => {
      try {
        await video.play();
      } catch {
        setCameraError(t("avatar.cameraPlayFailed"));
      }
    };
    void startVideo();

    return () => {
      if (video.srcObject === cameraStream) video.srcObject = null;
    };
  }, [cameraStream, step, t]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function useFile(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setGenerationError("");
    setStep("preview");
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) useFile(file);
    event.target.value = "";
  }

  async function openCamera() {
    stopCamera();
    setCameraError("");
    setCameraReady(false);
    setCameraLoading(true);
    setStep("camera");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(t("avatar.cameraUnsupported"));
      setCameraLoading(false);
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      setCameraStream(stream);
    } catch {
      setCameraError(t("avatar.cameraDenied"));
      setStep("camera");
    } finally {
      setCameraLoading(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !cameraReady || !video.videoWidth || !video.videoHeight) {
      setCameraError(t("avatar.cameraNotReady"));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      stopCamera();
      useFile(new File([blob], "nana-camera.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  }

  async function generate() {
    if (!imageFile) return;
    setStep("generating");
    setGenerationError("");
    setGenerationPhase(2);
    const phaseTimer = window.setInterval(() => {
      setGenerationPhase((current) => (current < 4 ? ((current + 1) as GenerationPhase) : current));
    }, 900);

    try {
      const generatedAvatar = await generatePetAvatar(imageFile, undefined, locale);
      await animatePetAvatar(generatedAvatar);
      setGenerationPhase(4);
      if (generatedAvatar.animationSource === "css-fallback") {
        setGenerationError(t("avatar.localFallback"));
      }
      setAvatar(generatedAvatar);
      setStep("result");
    } catch {
      setGenerationError(t("avatar.localFallback"));
      setAvatar({
        id: `nana-avatar-${Date.now()}`,
        sourceImageUrl: previewUrl,
        avatarImageUrl: previewUrl,
        style: "css-fallback-digital-character",
        personalitySeed: "local animation fallback",
        createdAt: new Date().toISOString(),
        frames: [],
        animationType: "idle",
        animationSource: "css-fallback",
      });
      setStep("result");
    } finally {
      window.clearInterval(phaseTimer);
    }
  }

  function reset() {
    stopCamera();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setImageFile(null);
    setAvatar(null);
    setGenerationError("");
    setGenerationPhase(1);
    setStep("select");
  }

  const progress =
    step === "select" || step === "camera"
      ? 1
      : step === "preview"
        ? 2
        : step === "generating"
          ? 3
          : 4;

  return (
    <div className="absolute inset-0 z-[70] flex flex-col bg-cream">
      <header className="flex items-center justify-between px-4 pb-3 pt-5">
        <button
          onClick={step === "select" ? onClose : reset}
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-600 shadow-sm"
          aria-label={t("avatar.back")}
        >
          {step === "select" ? <X size={19} /> : <ChevronLeft size={20} />}
        </button>
        <div className="text-center">
          <h2 className="font-bold">{t("avatar.title")}</h2>
          <p className="mt-0.5 text-[10px] text-stone-400">{t("avatar.subtitle")}</p>
        </div>
        <div className="w-10" />
      </header>

      <div className="flex gap-1.5 px-5">
        {[1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className={`h-1.5 flex-1 rounded-full transition ${
              item <= progress ? "bg-cocoa" : "bg-sand/60"
            }`}
          />
        ))}
      </div>

      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-6">
        {step === "select" && (
          <div>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-sand/45 text-cocoa">
              <ImagePlus size={34} />
            </div>
            <h3 className="mt-5 text-center text-2xl font-black">{t("avatar.stepUpload")}</h3>
            <p className="mx-auto mt-2 max-w-[300px] text-center text-sm leading-6 text-stone-500">
              {t("avatar.uploadHint")}
            </p>
            <div className="mt-8 grid gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 rounded-[22px] bg-cocoa px-5 py-4 text-sm font-bold text-white shadow-soft"
              >
                <Upload size={19} /> {t("avatar.upload")}
              </button>
              <button
                onClick={openCamera}
                className="flex items-center justify-center gap-3 rounded-[22px] border border-sand bg-white px-5 py-4 text-sm font-bold text-stone-700"
              >
                <Camera size={19} className="text-cocoa" /> {t("avatar.camera")}
              </button>
            </div>
            {cameraError && (
              <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-center text-xs text-rose-600">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {step === "camera" && (
          <div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[30px] bg-black shadow-soft">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={() => {
                  void videoRef.current?.play();
                }}
                onCanPlay={() => {
                  setCameraReady(true);
                  setCameraLoading(false);
                  setCameraError("");
                }}
                className="h-full w-full object-cover"
              />
              {(cameraLoading || !cameraReady) && !cameraError && (
                <div className="absolute inset-0 grid place-items-center bg-black text-center text-white">
                  <div>
                    <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <p className="mt-3 text-xs text-white/70">{t("avatar.cameraStarting")}</p>
                  </div>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 grid place-items-center bg-black px-8 text-center text-white">
                  <div>
                    <Camera className="mx-auto text-white/50" size={34} />
                    <p className="mt-3 text-xs leading-5 text-white/70">{cameraError}</p>
                    <button
                      onClick={openCamera}
                      className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink"
                    >
                      {t("avatar.cameraRetry")}
                    </button>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-5 rounded-[26px] border border-white/50" />
            </div>
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-full border-[5px] border-white bg-cocoa text-white shadow-soft ring-2 ring-cocoa disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Camera size={24} />
            </button>
            <p className="mt-3 text-center text-[10px] text-stone-400">
              {cameraReady ? t("avatar.cameraReady") : t("avatar.cameraStarting")}
            </p>
          </div>
        )}

        {step === "preview" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cocoa">
              {t("avatar.stepPreview")}
            </p>
            <div className="mt-3 overflow-hidden rounded-[30px] bg-white p-2 shadow-soft">
              <img
                src={previewUrl}
                alt={t("avatar.sourcePreview")}
                className="aspect-square w-full rounded-[24px] object-cover object-center"
              />
            </div>
            <div className="mt-4 rounded-[22px] bg-white p-4 text-xs leading-5 text-stone-500">
              <Sparkles className="mr-2 inline text-cocoa" size={15} />
              {t("avatar.analysisReady")}
            </div>
            <button
              onClick={generate}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[22px] bg-cocoa py-4 text-sm font-bold text-white shadow-soft"
            >
              <Sparkles size={18} /> {t("avatar.generate")}
            </button>
          </div>
        )}

        {step === "generating" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
            <div className="relative grid h-40 w-40 place-items-center">
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-cocoa/50" />
              <span className="absolute inset-5 animate-pulse rounded-full bg-sand/60" />
              <Sparkles className="relative text-cocoa" size={40} />
            </div>
            <h3 className="mt-7 text-2xl font-black">{t("avatar.generating")}</h3>
            <p className="mt-3 max-w-[290px] text-sm leading-6 text-stone-500">
              {t("avatar.generatingHint")}
            </p>
            <div className="mt-7 w-full space-y-2 rounded-[24px] bg-white p-4 text-left shadow-soft">
              {generationSteps.map(([key, phase]) => (
                <div key={key} className="flex items-center gap-3 text-xs font-bold">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full ${
                      generationPhase >= phase ? "bg-cocoa text-white" : "bg-cream text-stone-400"
                    }`}
                  >
                    {phase}
                  </span>
                  <span className={generationPhase >= phase ? "text-ink" : "text-stone-400"}>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "result" && avatar && (
          <div>
            <div className="relative mx-auto h-[330px] w-full">
              <AnimatedPetAvatar
                frames={avatar.frames}
                fallbackAvatar={avatar.avatarImageUrl}
                petName="Nana"
              />
              <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold text-cocoa shadow-sm backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {t("avatar.alive")}
              </span>
            </div>
            <div className="mt-5 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check size={20} />
              </span>
              <h3 className="mt-3 text-2xl font-black">{t("avatar.completeTitle")}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {t("avatar.completeDescription")}
              </p>
              <p className="mt-3 text-xs font-bold text-cocoa">{t("avatar.generatedByGemini")}</p>
              {avatar.avatarSpec?.personalityImpression && (
                <p className="mx-auto mt-2 max-w-[290px] rounded-2xl bg-white px-4 py-3 text-xs leading-5 text-stone-500 shadow-sm">
                  {avatar.avatarSpec.personalityImpression}
                </p>
              )}
              {generationError && (
                <p className="mx-auto mt-2 max-w-[290px] rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                  {generationError}
                </p>
              )}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["avatar.tagAi", "avatar.tagMemory", "avatar.tagPersonality"].map((key) => (
                <span key={key} className="rounded-full bg-sand/45 px-3 py-2 text-[10px] font-bold text-cocoa">
                  {t(key)}
                </span>
              ))}
            </div>
            <button
              onClick={() => onComplete(avatar)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[22px] bg-cocoa py-4 text-sm font-bold text-white"
            >
              {t("avatar.activate")} <Sparkles size={17} />
            </button>
            <button
              onClick={reset}
              className="mt-3 flex w-full items-center justify-center gap-2 py-2 text-xs font-bold text-stone-400"
            >
              <RefreshCw size={14} /> {t("avatar.tryAgain")}
            </button>
          </div>
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
