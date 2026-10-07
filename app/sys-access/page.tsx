import { Metadata } from 'next'
import AdminPortalClient from './AdminPortalClient'

export const metadata: Metadata = {
  title: 'System Access',
  description: 'Internal System Access Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function AdminPage() {
  return <AdminPortalClient />
}
