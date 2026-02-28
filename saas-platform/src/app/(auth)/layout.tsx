export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth routes have no sidebar - just the content
    return <>{children}</>;
}
