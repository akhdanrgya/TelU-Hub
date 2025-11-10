"use client";

import React from "react";
import NextLink from "next/link";
import { Link } from "@heroui/link";
import { siteConfig } from "@/config/site";
import { Logo, TwitterIcon, GithubIcon, DiscordIcon } from "@/components/icons";

export const Footer = () => {
  return (
    <footer className="w-full bg-content1 p-8 mt-12 border-t border-default-200">
      <div className="container mx-auto max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="flex flex-col gap-2">
            <NextLink href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold text-inherit">{siteConfig.name}</span>
            </NextLink>
            <p className="text-sm text-default-500 max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Navigasi</h3>
            {siteConfig.navItems.map((item) => (
              <Link
                key={item.href}
                as={NextLink}
                href={item.href}
                color="foreground"
                size="sm"
                className="hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <Link
              as={NextLink}
              href="/privacy"
              color="foreground"
              size="sm"
              className="hover:text-primary"
            >
              Kebijakan Privasi
            </Link>
            <Link
              as={NextLink}
              href="/terms"
              color="foreground"
              size="sm"
              className="hover:text-primary"
            >
              Syarat & Ketentuan
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-foreground">Hubungi Kami</h3>
            <Link
              as={NextLink}
              href="/contact"
              color="foreground"
              size="sm"
              className="hover:text-primary"
            >
              Kontak
            </Link>
            <div className="flex gap-4 mt-2">
              <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter">
                <TwitterIcon className="text-default-500" />
              </Link>
              <Link isExternal href={siteConfig.links.discord} aria-label="Discord">
                <DiscordIcon className="text-default-500" />
              </Link>
              <Link isExternal href={siteConfig.links.github} aria-label="Github">
                <GithubIcon className="text-default-500" />
              </Link>
            </div>
          </div>

        </div>
        <div className="border-t border-default-200 mt-8 pt-6 text-center">
          <p className="text-sm text-default-500">
            © {new Date().getFullYear()} {siteConfig.name}. Bismillah Nilainya A 🤲.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;