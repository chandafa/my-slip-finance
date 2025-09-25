"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Volume2, Contrast, ZoomIn, Palette, Type, Droplets, Ear, Subtitles, Keyboard, MousePointerClick, AudioLines, Focus, Bot, ScanText, Fingerprint } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useAccessibility } from "@/hooks/use-accessibility";

export default function AccessibilitySettingsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const { 
        highContrast, setHighContrast, 
        textSize, setTextSize
    } = useAccessibility();

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
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                        <Label htmlFor="tts-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Volume2 className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_tts_label')}
                        </Label>
                        <Switch id="tts-switch" />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="subtitles-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Subtitles className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_subtitles_label')}
                        </Label>
                        <Switch id="subtitles-switch" />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="auto-transcription-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <AudioLines className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_transcription_label')}
                        </Label>
                        <Switch id="auto-transcription-switch" />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="visual-alerts-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Ear className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_visual_alerts_label')}
                        </Label>
                        <Switch id="visual-alerts-switch" />
                    </div>
                </CardContent>
            </Card>

            {/* Vision */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_vision_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                     <div className="flex items-center justify-between pt-4 first:pt-0">
                        <Label htmlFor="high-contrast-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Contrast className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_high_contrast_label')}
                        </Label>
                        <Switch id="high-contrast-switch" checked={highContrast} onCheckedChange={setHighContrast} />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="zoom-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <ZoomIn className="h-5 w-5 text-muted-foreground" />
                           {t('accessibility_zoom_label')}
                        </Label>
                        <Switch id="zoom-switch" />
                    </div>
                    <Link href="/pengaturan">
                         <div className="flex items-center justify-between pt-4">
                            <Label className="flex items-center gap-4 cursor-pointer text-base">
                                <Palette className="h-5 w-5 text-muted-foreground" />
                               {t('appearance_title')}
                            </Label>
                            <span className="text-sm text-muted-foreground">{t('accessibility_dark_mode_note')}</span>
                        </div>
                    </Link>
                    <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="color-filter-select" className="flex items-center gap-4 cursor-pointer text-base">
                             <Droplets className="h-5 w-5 text-muted-foreground" />
                             {t('accessibility_color_filter_label')}
                        </Label>
                        <Select>
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
            
            {/* Motor / Physical */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_motor_title')}</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4 divide-y">
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                        <Label htmlFor="keyboard-control-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Keyboard className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_keyboard_control_label')}
                        </Label>
                        <span className="text-sm text-muted-foreground">{t('accessibility_enabled_default')}</span>
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="voice-control-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_voice_control_label')}
                        </Label>
                        <Switch id="voice-control-switch" />
                    </div>
                </CardContent>
            </Card>

            {/* Cognitive */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_cognitive_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                     <div className="flex items-center justify-between pt-4 first:pt-0">
                        <Label htmlFor="focus-mode-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Focus className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_focus_mode_label')}
                        </Label>
                        <Switch id="focus-mode-switch" />
                    </div>
                    <Link href="/chatbot">
                        <div className="flex items-center justify-between pt-4">
                            <Label className="flex items-center gap-4 cursor-pointer text-base">
                                <Bot className="h-5 w-5 text-muted-foreground" />
                                {t('accessibility_interactive_guide_label')}
                            </Label>
                            <span className="text-sm text-muted-foreground">{t('accessibility_ask_chatbot')}</span>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            {/* Other */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('accessibility_other_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                    <div className="flex items-center justify-between pt-4 first:pt-0">
                        <Label htmlFor="font-size-select" className="flex items-center gap-4 cursor-pointer text-base">
                            <Type className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_font_size_label')}
                        </Label>
                         <Select value={textSize} onValueChange={(value) => setTextSize(value as 'text-base' | 'text-sm' | 'text-lg')}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text-sm">{t('accessibility_font_size_small')}</SelectItem>
                                <SelectItem value="text-base">{t('accessibility_font_size_default')}</SelectItem>
                                <SelectItem value="text-lg">{t('accessibility_font_size_large')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="haptic-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <Fingerprint className="h-5 w-5 text-muted-foreground" />
                            {t('accessibility_haptic_label')}
                        </Label>
                        <Switch id="haptic-switch" />
                    </div>
                     <div className="flex items-center justify-between pt-4">
                        <Label htmlFor="qr-reader-switch" className="flex items-center gap-4 cursor-pointer text-base">
                            <ScanText className="h-5 w-5 text-muted-foreground" />
                           {t('accessibility_qr_reader_label')}
                        </Label>
                        <Switch id="qr-reader-switch" />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
