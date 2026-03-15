import { Nunito } from "next/font/google"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={nunito.className}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #16a34a 0%, #166534 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft white blob circles */}
      <div style={{ position: "absolute", top: "-18%", left: "-12%", width: 680, height: 680, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-22%", right: "-10%", width: 580, height: 580, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "38%", right: "6%", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "12%", left: "18%", width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,0.035)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

      {/* Card wrapper */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 460 }}>
        {children}
      </div>
    </div>
  )
}
