"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionItemProps {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
    index: number;
}

function FAQAccordionItem({
    item,
    isOpen,
    onToggle,
    index,
}: FAQAccordionItemProps) {
    return (
        <motion.div
            className={`faq-item ${isOpen ? "open" : ""}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
        >
            <button
                className="faq-trigger"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{item.question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    {isOpen ? (
                        <Minus className="w-5 h-5 text-primary" />
                    ) : (
                        <Plus className="w-5 h-5 text-foreground-muted" />
                    )}
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="faq-content">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

interface FAQAccordionProps {
    items: FAQItem[];
    allowMultiple?: boolean;
}

export function FAQAccordion({ items, allowMultiple = false }: FAQAccordionProps) {
    const [openItems, setOpenItems] = useState<number[]>([]);

    const handleToggle = (index: number) => {
        if (allowMultiple) {
            setOpenItems((prev) =>
                prev.includes(index)
                    ? prev.filter((i) => i !== index)
                    : [...prev, index]
            );
        } else {
            setOpenItems((prev) =>
                prev.includes(index) ? [] : [index]
            );
        }
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <FAQAccordionItem
                    key={index}
                    item={item}
                    isOpen={openItems.includes(index)}
                    onToggle={() => handleToggle(index)}
                    index={index}
                />
            ))}
        </div>
    );
}

// Default FAQ items for Quleex
export const defaultFAQItems: FAQItem[] = [
    {
        question: "מה זה Quleex ואיך זה עובד?",
        answer:
            "Quleex היא פלטפורמה לניטור נראות העסק שלך במנועי חיפוש AI כמו ChatGPT, Claude ו-Perplexity. המערכת סורקת באופן אוטומטי את התוצאות ומספקת לך דוחות מפורטים והמלצות לשיפור.",
    },
    {
        question: "אילו מנועי AI אתם מנטרים?",
        answer:
            "אנחנו מנטרים את כל מנועי החיפוש המבוססים על AI המובילים בשוק: ChatGPT, Claude (Anthropic), Perplexity, Google Gemini, Microsoft Copilot ועוד. הרשימה מתעדכנת באופן שוטף.",
    },
    {
        question: "כמה זמן לוקח לראות תוצאות?",
        answer:
            "הדוח הראשוני מופק תוך דקות ספורות. שיפורים בנראות תלויים ביישום ההמלצות שלנו, אבל לקוחות רבים מדווחים על שיפור משמעותי תוך 2-4 שבועות.",
    },
    {
        question: "האם יש תקופת ניסיון חינם?",
        answer:
            "כן! אנחנו מציעים ניתוח ראשוני חינם לגמרי, ללא צורך בכרטיס אשראי. תוכל לראות את הדוח המלא ולהחליט אם להמשיך עם אחת מהתוכניות שלנו.",
    },
    {
        question: "איך מחושבת הנראות שלי ב-AI?",
        answer:
            "אנחנו מריצים מאות שאילתות רלוונטיות לתחום שלך ובודקים כמה פעמים (ובאיזה מיקום) העסק שלך מוזכר בתוצאות. הציון הסופי משקלל את התדירות, המיקום והקונטקסט של האזכורים.",
    },
    {
        question: "האם הנתונים שלי מאובטחים?",
        answer:
            "בהחלט. אנחנו עומדים בתקני האבטחה הגבוהים ביותר כולל SOC 2 Type II ו-GDPR. כל הנתונים מוצפנים והגישה אליהם מוגבלת. אנחנו לא חולקים נתונים עם צדדים שלישיים.",
    },
];
