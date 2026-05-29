import Image from "next/image"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-800 to-green-950 p-12 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-green-300 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Image
            src="/jknowledge_logo.png"
            alt="jknowledge"
            width={44}
            height={44}
            className="rounded-xl shadow-lg"
          />
          <span className="text-xl font-bold tracking-tight">jknowledge</span>
        </div>

        {/* Headline */}
        <div className="relative space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            วิเคราะห์คะแนน TCAS
            <br />
            <span className="text-green-300">ด้วย AI</span>
          </h1>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            เปรียบเทียบคะแนนย้อนหลัง ทำนายโอกาสรับ
            <br />
            และรับคำแนะนำคณะที่เหมาะกับคุณ
          </p>

          {/* Feature list */}
          <ul className="space-y-2.5 text-green-100 text-sm">
            {[
              "คะแนน TCAS ย้อนหลัง 5 ปี (64–68)",
              "วิเคราะห์โอกาสรับ min / avg / max",
              "แนะนำคณะจาก MBTI 16 แบบ",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-6 pt-8 border-t border-green-700/60">
          {[
            { value: "5 ปี", label: "ข้อมูลย้อนหลัง" },
            { value: "1,000+", label: "คณะ/หลักสูตร" },
            { value: "16 แบบ", label: "MBTI คณะแนะนำ" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-green-400 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Image
              src="/jknowledge_logo.png"
              alt="jknowledge"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-foreground text-lg">jknowledge</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
