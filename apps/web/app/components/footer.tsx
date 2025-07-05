'use client'

import Link from 'next/link'
import { Mic, Twitter, Linkedin, Github, Youtube, Mail, MapPin, Phone, ExternalLink, Heart, ArrowUpRight } from 'lucide-react'
import { Newsletter } from './ui/newsletter'
import { Button } from './ui/button'
import { motion } from 'framer-motion'

export function Footer() {
  const footerLinks = {
    explore: [
      { label: 'Jobs Board', href: '/jobs' },
      { label: 'Events Calendar', href: '/events' },
      { label: 'Products Directory', href: '/products' },
      { label: 'Companies', href: '/companies' },
    ],
    resources: [
      { label: 'Blog', href: '/blog' },
      { label: 'Guides', href: '/guides' },
      { label: 'Webinars', href: '/webinars' },
      { label: 'Case Studies', href: '/case-studies' },
    ],
    community: [
      { label: 'Discord', href: '#', external: true },
      { label: 'Slack Community', href: '#', external: true },
      { label: 'Developer Forum', href: '/forum' },
      { label: 'Meetups', href: '/meetups' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers', badge: 'Hiring' },
      { label: 'Press Kit', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  }

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ]

  return (
    <footer className="mt-auto bg-gradient-to-b from-background to-muted/20">
      {/* Newsletter Section */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-4 py-16">
          <Newsletter variant="inline" />
        </div>
      </section>

      {/* Main Footer */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <motion.div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Mic className="h-6 w-6 text-white" />
                </motion.div>
                <span className="font-serif text-2xl font-bold">Voice AI Space</span>
              </Link>
              
              <p className="mt-4 text-muted-foreground">
                The premier destination for voice AI professionals. Discover opportunities, 
                connect with innovators, and explore cutting-edge technology.
              </p>

              {/* Social Links */}
              <div className="mt-6 flex gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-primary hover:text-white"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-8 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:hello@voiceaispace.com" className="hover:text-primary">
                    hello@voiceaispace.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+1234567890" className="hover:text-primary">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>
                    548 Market Street #35410<br />
                    San Francisco, CA 94104
                  </span>
                </div>
              </div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 gap-8 lg:col-span-8 lg:grid-cols-4">
              {/* Explore */}
              <div>
                <h3 className="mb-4 font-semibold">Explore</h3>
                <ul className="space-y-3">
                  {footerLinks.explore.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="mb-4 font-semibold">Resources</h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community */}
              <div>
                <h3 className="mb-4 font-semibold">Community</h3>
                <ul className="space-y-3">
                  {footerLinks.community.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                        {link.external && <ExternalLink className="h-3 w-3" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="mb-4 font-semibold">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                        {link.badge && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 lg:flex-row">
            {/* Copyright */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} Voice AI Space.</span>
              <span>All rights reserved.</span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Cookie Policy
              </Link>
              <Link
                href="/sitemap"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Sitemap
              </Link>
            </div>

            {/* Made with Love */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 fill-current text-red-500" />
              <span>in San Francisco</span>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:shadow-xl lg:flex"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUpRight className="h-5 w-5" />
      </motion.button>
    </footer>
  )
}