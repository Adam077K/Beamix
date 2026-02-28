"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Loader2, Building2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUSINESS_CATEGORIES = [
    { id: "relocation", label: "שירותי הובלה", icon: "🚚" },
    { id: "legal", label: "שירותים משפטיים", icon: "⚖️" },
    { id: "healthcare", label: "בריאות", icon: "🏥" },
    { id: "real_estate", label: "נדל״ן", icon: "🏠" },
    { id: "finance", label: "פיננסים", icon: "💰" },
    { id: "beauty", label: "יופי וטיפוח", icon: "💅" },
    { id: "tech", label: "טכנולוגיה", icon: "💻" },
    { id: "education", label: "חינוך", icon: "📚" },
    { id: "other", label: "אחר", icon: "📦" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        websiteUrl: "",
        businessCategory: "",
        region: "israel",
    });

    const handleSubmit = async () => {
        if (!formData.websiteUrl || !formData.businessCategory) {
            setError("אנא מלא את כל השדות");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("User not found");
            }

            // Update customer record
            const { error: updateError } = await supabase
                .from("customers")
                .update({
                    website_url: formData.websiteUrl,
                    business_category: formData.businessCategory,
                    region: formData.region,
                })
                .eq("id", user.id);

            if (updateError) throw updateError;

            // Log the onboarding completion
            await supabase.from("automation_logs").insert({
                workflow_name: "onboarding_complete",
                client_id: user.id,
                status: "success",
            });

            // TODO: Trigger n8n analysis workflow via webhook
            // await fetch(process.env.N8N_WEBHOOK_BASE_URL + '/analyze', {
            //   method: 'POST',
            //   body: JSON.stringify({ client_id: user.id, website_url: formData.websiteUrl })
            // });

            // Redirect to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "שגיאה בשמירת הנתונים");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground-secondary">
                            שלב {step} מתוך 2
                        </span>
                        <span className="text-sm text-foreground-secondary">
                            {step === 1 ? "50%" : "100%"}
                        </span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: step === 1 ? "50%" : "100%" }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="card animate-fade-in">
                    {step === 1 ? (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Globe className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">מה כתובת האתר שלך?</h1>
                                    <p className="text-sm text-foreground-secondary">
                                        אנחנו ננתח את האתר שלך
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="website"
                                        className="block text-sm font-medium mb-1.5"
                                    >
                                        כתובת האתר
                                    </label>
                                    <input
                                        id="website"
                                        type="url"
                                        value={formData.websiteUrl}
                                        onChange={(e) =>
                                            setFormData({ ...formData, websiteUrl: e.target.value })
                                        }
                                        placeholder="https://example.com"
                                        className="input"
                                        dir="ltr"
                                    />
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.websiteUrl}
                                    className="btn btn-primary w-full py-2.5"
                                >
                                    המשך
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">באיזה תחום אתה עוסק?</h1>
                                    <p className="text-sm text-foreground-secondary">
                                        נתאים את הניתוח לתחום שלך
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {BUSINESS_CATEGORIES.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setFormData({ ...formData, businessCategory: category.id })
                                        }
                                        className={`p-3 rounded-lg border text-center transition-all ${formData.businessCategory === category.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <span className="text-2xl mb-1 block">{category.icon}</span>
                                        <span className="text-xs font-medium">{category.label}</span>
                                        {formData.businessCategory === category.id && (
                                            <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="btn btn-secondary flex-1"
                                >
                                    חזור
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.businessCategory}
                                    className="btn btn-primary flex-1"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            מעבד...
                                        </>
                                    ) : (
                                        "התחל ניתוח"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
