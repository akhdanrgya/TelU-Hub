import Link from "next/link"

const Footer = () => {
    return (
        <footer className="w-full bg-gray-100 dark:bg-gray-900 p-6 mt-12">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-sm">
            © 2025 TelU-Hub Store. Bismillah Nilainya A.
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <Link href="/about" >Tentang Kami</Link>
            <Link href="/privacy">Kebijakan Privasi</Link>
            <Link href="/contact">Kontak</Link>
          </div>
        </div>
      </footer>
    )
}

export default Footer