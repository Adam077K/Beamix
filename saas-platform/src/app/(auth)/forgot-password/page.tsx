"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const supabase = createClient();

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${window.location.origin}/reset-password`,
                }
            );

            if (resetError) {
                throw new Error(resetError.message);
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "שגיאה בשליחת האימייל");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
                <div className="w-full max-w-md">
                    <div className="card animate-fade-in text-center">
                        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">
                            בדוק את האימייל שלך
                        </h1>
                        <p className="text-foreground-secondary mb-6">
                            שלחנו לך קישור לאיפוס הסיסמה.
                            <br />
                            בדוק את תיבת הדואר הנכנס שלך.
                        </p>
                        <Link href="/login" className="btn btn-secondary">
                            חזור להתחברות
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-10 w-10 flex items-center justify-center">
                            <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path d="M21.0883 0.0120844C21.2293 0.111436 21.438 0.201389 21.438 0.567917L21.4298 7.39903C17.1094 7.38829 12.8311 7.37218 8.5947 7.35069C7.83308 7.34532 7.45091 7.68232 7.4482 8.36167C7.42109 14.0301 7.41703 18.2485 7.436 21.0169C7.43653 21.0439 7.44242 21.0705 7.45333 21.0953C7.46424 21.12 7.47996 21.1423 7.4996 21.161C7.51923 21.1797 7.54239 21.1944 7.56775 21.2042C7.59311 21.2141 7.62018 21.2189 7.64741 21.2183C15.5347 21.1499 21.2103 15.1324 21.4298 7.39903L28.5446 7.39097C28.6334 7.39097 28.7187 7.42563 28.7818 7.48746C28.845 7.54929 28.881 7.63329 28.8821 7.72125L29 20.884V29H24.5969H21.3445V20.9732C21.3445 20.9732 21.0484 24.5079 17.6854 26.3819C14.3224 28.256 11.7903 28.3958 11.7903 28.3958L10.5706 28.6294L9.3509 28.6738C9.1151 28.7194 7.78429 28.6831 7.61895 28.6294C7.55457 28.6086 7.49876 28.5678 7.45991 28.5133C7.42105 28.4589 7.40125 28.3936 7.40348 28.3274C7.47666 26.104 7.46852 23.874 7.37908 21.6372C7.37366 21.4681 7.30861 21.358 7.18393 21.3069C7.05925 21.2559 6.91154 21.1821 6.50498 21.1458C6.09842 21.1096 6.16353 21.1096 5.85448 21.1096C3.93822 21.1552 1.98673 21.1619 0 21.1297L0.0040657 7.8582C0.0040657 7.62105 0.0987284 7.39361 0.26723 7.22592C0.435731 7.05823 0.664268 6.96403 0.902565 6.96403C2.50442 6.95866 4.18758 6.95195 5.95205 6.94389C6.61068 6.9412 6.9549 6.53171 6.98472 5.71542C6.99827 5.33144 7.00776 3.72972 7.01318 0.910279C7.01318 0.303427 7.37366 0 8.09463 0C12.4204 0.00268519 16.7517 0.00671401 21.0883 0.0120844Z" fill="#FCF9E8"/>
                            </svg>
                        </div>
                        <span className="text-2xl font-bold">Quleex</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="card animate-fade-in">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        שכחת סיסמה?
                    </h1>
                    <p className="text-foreground-secondary text-center mb-6">
                        הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
                    </p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium mb-1.5"
                            >
                                אימייל
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                className="input"
                                dir="ltr"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-2.5"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    שולח...
                                </>
                            ) : (
                                "שלח קישור איפוס"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-foreground-secondary">
                        נזכרת בסיסמה?{" "}
                        <Link
                            href="/login"
                            className="text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                            התחבר
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
