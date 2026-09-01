// app/(marketing)/landing/Landing.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Heart,
  Lightbulb,
  Check,
  X,
  ChevronDown,
  BookOpen,
  Instagram,
  Twitter,
  Facebook,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Badge, Feature, Stat } from './Landing.types';
import {
  NAVIGATION_LINKS,
  HERO_TITLE,
  HERO_DESCRIPTION,
  HERO_CTA,
  FEATURES_ROW_1,
  FEATURES_ROW_2,
  BENEFITS,
  TESTIMONIALS,
  COMPARISON_GROWMYIQ,
  COMPARISON_TRADITIONAL,
  FAQS,
  CTA_TITLE,
  CTA_DESCRIPTION,
  CTA_PRIMARY,
  CTA_SECONDARY,
  FOOTER_LINKS,
  SOCIAL_LINKS,
  FOOTER_COPYRIGHT,
} from './Landing.constants';

const ICON_MAP = {
  star: Star,
  'check-circle': CheckCircle,
  'chart-line': TrendingUp,
  users: Users,
  clock: Clock,
  trophy: Trophy,
  heart: Heart,
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944v0A11.955 11.955 0 014.382 8.984M9 16l3-3m0 0l3 3m0-3h3M9 12h3" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Grow<span className="text-primary">MyIQ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#ncert" className="text-muted-foreground hover:text-foreground transition-colors">
              NCERT Classes 1–12
            </a>
            <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
              Interactive Demo
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth">
              <Button className="px-5 py-2 rounded-full font-medium text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-16">
        {/* Gradient overlays using only theme colors */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary" />
        <div className="absolute inset-0 bg-gradient-to-t from-accent via-transparent to-transparent opacity-30" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold mb-6 backdrop-blur-sm">
            <span>✨ Curriculum Aligned • NCERT Classes 1 to 12</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground text-shadow-primary leading-tight">
            {HERO_TITLE}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
            {HERO_DESCRIPTION}
          </p>

          {/* Enhanced CTA Button with glassmorphism and shadows */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button className="px-8 py-4 rounded-full font-medium text-lg bg-primary hover:bg-primary/90 text-primary-foreground cta-button shadow-lg">
                {HERO_CTA}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" className="px-8 py-4 rounded-full font-medium text-lg border-primary/40 text-foreground hover:bg-primary/10">
                Browse Features
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section 1 */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES_ROW_1.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section 2 - NCERT */}
      <section id="ncert" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES_ROW_2.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold mb-4">
              BENEFITS
            </div>
            <h2 className="text-4xl font-bold mb-4 text-shadow-primary">Why Choose Us?</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Innovative tools and powerful insights designed to elevate your
              studying.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BENEFITS.map((benefit) => (
              <Card
                key={benefit.title}
                className="bg-card border-none p-6 benefit-card"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold mb-4">
              WALL OF LOVE
            </div>
            <h2 className="text-4xl font-bold mb-4 text-shadow-primary">Loved by many</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-card border-none p-6 testimonial-card"
              >
                <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                <div className="flex text-primary mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold mb-4">
              COMPARISON
            </div>
            <h2 className="text-4xl font-bold mb-4 text-shadow-primary">Why GrowMyIQ Stands Out</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-none p-6 benefit-card">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 py-1 rounded-md">
                  <span className="font-bold">Grow</span>
                  <span className="font-bold">MyIQ</span>
                </div>
              </div>
              {COMPARISON_GROWMYIQ.map((item, index) => (
                <ComparisonItem
                  key={index}
                  feature={item.feature}
                  hasFeature={item.hasFeature}
                />
              ))}
            </Card>
            <Card className="bg-card border-none p-6 benefit-card">
              <div className="flex items-center mb-6">
                <BookOpen className="w-5 h-5 mr-2" />
                <span className="font-semibold">Unplanned Learning</span>
              </div>
              {COMPARISON_TRADITIONAL.map((item, index) => (
                <ComparisonItem
                  key={index}
                  feature={item.feature}
                  hasFeature={item.hasFeature}
                />
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold mb-4">
              FAQ'S SECTION
            </div>
            <h2 className="text-4xl font-bold mb-4 text-shadow-primary">Some Common FAQ's</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Get answers to your questions and learn about our platform
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-lg px-4 border-none faq-item"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  {faq.answer && (
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-shadow-primary">{CTA_TITLE}</h2>
          <p className="max-w-2xl mx-auto mb-8 text-muted-foreground">
            {CTA_DESCRIPTION}
          </p>
          <div className="flex justify-center space-x-4 mb-12">
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-6 rounded-full font-medium text-base text-primary-foreground">
                {CTA_PRIMARY}
              </Button>
            </Link>
            <Link href="/csstest">
              <Button
                variant="outline"
                className="border-primary text-accent-foreground hover:bg-accent/10 px-6 py-6 rounded-full font-medium text-base"
              >
                {CTA_SECONDARY}
              </Button>
            </Link>
          </div>
          <div className="relative max-w-4xl mx-auto h-64 bg-card rounded-lg flex items-center justify-center text-muted-foreground">
            Mobile App Preview Dashboard
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 py-1 rounded-md inline-block">
                <span className="font-bold">Grow</span>
                <span className="font-bold">MyIQ</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 items-center">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                Book a Demo
              </Button>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {SOCIAL_LINKS.map((social) => {
                const Icon =
                  social.platform === 'instagram'
                    ? Instagram
                    : social.platform === 'twitter'
                    ? Twitter
                    : Facebook;
                return (
                  <a
                    key={social.platform}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <div className="text-muted-foreground text-sm text-center">
              {FOOTER_COPYRIGHT}
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-muted-foreground text-sm">Made in Framer</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="bg-card border-none p-6 feature-card">
      <h3 className="text-xl font-semibold mb-3 text-shadow-secondary">{feature.title}</h3>
      <p className="text-muted-foreground mb-4">{feature.description}</p>

      {feature.badges && feature.badges.length > 0 && (
        <div className="space-y-2 mb-4">
          {feature.badges.map((badge, index) => {
            const Icon = ICON_MAP[badge.icon];
            const bgColor =
              badge.icon === 'star'
                ? 'bg-primary'
                : badge.icon === 'check-circle'
                ? 'bg-secondary'
                : 'bg-accent';
            return (
              <div key={index} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${bgColor}`}
                >
                  <Icon className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{badge.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {feature.hasChart && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Quiz Scores</span>
            <span>All time</span>
          </div>
          <div className="h-32 w-full bg-card rounded flex items-end justify-between p-2 gap-1">
            {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
              <div
                key={i}
                className="bg-primary flex-1 rounded-t chart-bar"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked
                readOnly
                className="mr-2 accent-primary"
              />
              <span>Better score anytime</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked
                readOnly
                className="mr-2 accent-primary"
              />
              <span>Watch Stats & Growth</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked
                readOnly
                className="mr-2 accent-primary"
              />
              <span>Start Growing Now</span>
            </div>
          </div>
        </div>
      )}

      {feature.stats && feature.stats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {feature.stats.map((stat, index) => {
            const Icon = ICON_MAP[stat.icon];
            return (
              <div key={index} className="flex items-center">
                <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function ComparisonItem({
  feature,
  hasFeature,
}: {
  feature: string;
  hasFeature: boolean;
}) {
  return (
    <div className="flex items-start mb-4">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
          hasFeature ? 'bg-secondary' : 'bg-destructive'
        }`}
      >
        {hasFeature ? (
          <Check className="w-3 h-3 text-secondary-foreground" />
        ) : (
          <X className="w-3 h-3 text-destructive-foreground" />
        )}
      </div>
      <span className="text-muted-foreground">{feature}</span>
    </div>
  );
}
