
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, Contrast, ZoomIn, Palette, Type, Droplets } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AccessibilitySettingsPage() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold">{t('accessibility_page_title')}</h1>
            </div>

            {/* Hearing */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_hearing_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                    <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="tts-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Volume2 className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_tts_label')}
                        </Label>
                        <Switch id="tts-switch" />
                    </div>
                </CardContent>
            </Card>

            {/* Vision */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_vision_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="high-contrast-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Contrast className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_high_contrast_label')}
                        </Label>
                        <Switch id="high-contrast-switch" />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="zoom-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <ZoomIn className="h-5 w-5 text-muted-foreground" />
                           {t('accessibility_zoom_label')}
                        </Label>
                        <Switch id="zoom-switch" disabled />
                    </div>
                    <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="color-filter-select" className="flex items-center gap-4 cursor-pointer text-base">
                             <Droplets className="h-5 w-5 text-muted-foreground" />
                             {t('accessibility_color_filter_label')}
                        </Label>
                        <Select disabled>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('accessibility_color_filter_placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="protanopia">Protanopia</SelectItem>
                                <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                                <SelectItem value="tritanopia">Tritanopia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Other */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_other_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                    <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="font-size-select" className="flex items-center gap-4 cursor-pointer text-base">
                            <Type className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_font_size_label')}
                        </Label>
                         <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('accessibility_font_size_default')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">{t('accessibility_font_size_small')}</SelectItem>
                                <SelectItem value="default">{t('accessibility_font_size_default')}</SelectItem>
                                <SelectItem value="large">{t('accessibility_font_size_large')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
