import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Show, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/jknowledge_logo.png"
            alt="Jknowledge"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold text-gray-900">Jknowledge</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/analyze" className="hover:text-green-600 transition-colors">
            วิเคราะห์คะแนน
          </Link>
          <Link href="/scores" className="hover:text-green-600 transition-colors">
            คะแนนย้อนหลัง
          </Link>
          <Link href="/mbti" className="hover:text-green-600 transition-colors">
            แนะนำคณะ (MBTI)
          </Link>
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-gray-600 hover:text-green-600"
              )}
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              สมัครสมาชิก
            </Link>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-green-600 ring-offset-2 ring-offset-white",
                  userButtonPopoverCard:
                    "shadow-xl border border-border rounded-xl overflow-hidden",
                  userButtonPopoverHeader: "border-b border-border pb-3",
                  userPreviewMainIdentifier: "font-semibold text-foreground text-sm",
                  userPreviewSecondaryIdentifier: "text-muted-foreground text-xs",
                  userButtonPopoverActionButton:
                    "rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors",
                  userButtonPopoverActionButtonIcon: "text-muted-foreground",
                  userButtonPopoverActionButtonText: "text-sm font-medium",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
