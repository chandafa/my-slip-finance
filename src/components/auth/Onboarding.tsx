
"use client"

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const onboardingSteps = [
  {
    image: "https://picsum.photos/seed/onboarding1/800/600",
    titleKey: "onboarding_step1_title",
    descriptionKey: "onboarding_step1_desc",
    imageHint: "welcome finance app"
  },
  {
    image: "https://picsum.photos/seed/onboarding2/800/600",
    titleKey: "onboarding_step2_title",
    descriptionKey: "onboarding_step2_desc",
    imageHint: "transaction list"
  },
  {
    image: "https://picsum.photos/seed/onboarding3/800/600",
    titleKey: "onboarding_step3_title",
    descriptionKey: "onboarding_step3_desc",
    imageHint: "financial chart"
  },
];

export function Onboarding() {
  const router = useRouter();
  const { t } = useTranslation();
  const { markOnboardingComplete } = useAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < onboardingSteps.length - 1) {
      api?.scrollNext();
      setCurrent(current + 1);
    } else {
      markOnboardingComplete();
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background">
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent>
          {onboardingSteps.map((step, index) => (
            <CarouselItem key={index} className="w-full h-full">
              <div className="flex h-full flex-col">
                <div className="relative h-3/5 w-full">
                  <Image
                    src={step.image}
                    alt={t(step.titleKey)}
                    fill
                    className="object-cover"
                    data-ai-hint={step.imageHint}
                  />
                </div>
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                  <h2 className="text-2xl font-bold text-foreground">{t(step.titleKey)}</h2>
                  <p className="mt-2 text-muted-foreground">{t(step.descriptionKey)}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-0 w-full p-8 flex flex-col items-center">
         <div className="mb-6 flex space-x-2">
            {onboardingSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => { api?.scrollTo(i); setCurrent(i); }}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  current === i ? "w-4 bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        <Button onClick={handleNext} className="w-full max-w-sm rounded-full">
          {current < onboardingSteps.length - 1 ? t('onboarding_continue_button') : t('onboarding_start_button')}
          <ArrowRight className="ml-2" />
        </Button>
         {current < onboardingSteps.length - 1 && (
            <Button variant="ghost" className="mt-2" onClick={() => router.push('/dashboard')}>
                {t('onboarding_skip_button')}
            </Button>
         )}
      </div>
    </div>
  );
}

    