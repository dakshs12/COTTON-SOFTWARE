export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative p-4"
    >
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/login-screen-bg.png')",
          filter: "blur(4px)" // ~10-20% blur
        }}
      ></div>
      {/* Optional overlay if needed to make the box pop more: <div className="absolute inset-0 z-0 bg-black/10"></div> */}
      <div className="z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
