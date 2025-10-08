import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Juju Story Maker",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
