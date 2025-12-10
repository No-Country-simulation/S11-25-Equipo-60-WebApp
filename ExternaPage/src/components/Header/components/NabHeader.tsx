import { AuthHeader, LogoType } from "@/components"

export const NabHeader = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <LogoType sizeLogo={32} className="font-bold text-2xl" alt="Logo Externa Page" horizontal={true} />
      <AuthHeader />
    </div>
  )
}
