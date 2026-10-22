export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">فروشگاه</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          محتوا و محصولات توسط مدیر سایت تعریف می‌شوند. می‌توانید بدون ساخت
          حساب در این صفحه بمانید.
        </p>
      </div>
    </div>
  );
}
