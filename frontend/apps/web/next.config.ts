import type { NextConfig } from "next";
import path from "node:path";

const researchFrontendUrl =
  process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL ||
  "https://research.kisiiuniversity.ac.ke";
const libraryFrontendUrl =
  process.env.NEXT_PUBLIC_LIBRARY_FRONTEND_URL ||
  "https://library.kisiiuniversity.ac.ke";
const withPath = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@ksu/ui", "@ksu/api-client"],
  async redirects() {
    return [
      {
        source: "/about_us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about_adminstration",
        destination: "/about/governance-leadership",
        permanent: true,
      },
      {
        source: "/university_management_board",
        destination: "/about/university-management",
        permanent: true,
      },
      {
        source: "/admin_departments/administrative-division",
        destination: "/about/administrative-division",
        permanent: true,
      },
      {
        source: "/about/our-service-charter",
        destination: "/about/service-charter",
        permanent: true,
      },
      {
        source: "/admission/how-to-apply",
        destination: "/admissions/how-to-apply",
        permanent: true,
      },
      {
        source: "/admission/undergraduate-application",
        destination: "/admissions/undergraduate",
        permanent: true,
      },
      {
        source: "/admission/postgraduate-education",
        destination: "/admissions/postgraduate",
        permanent: true,
      },
      {
        source: "/admission/international-students",
        destination: "/admissions/international",
        permanent: true,
      },
      {
        source: "/admission/diploma-application",
        destination: "/admissions/diploma",
        permanent: true,
      },
      {
        source: "/admission/certificatebridging-application",
        destination: "/admissions/certificate-bridging",
        permanent: true,
      },
      {
        source: "/admission/kisii-university-2025-brochure",
        destination: "/admissions/brochures",
        permanent: true,
      },
      {
        source: "/admission/kisii-university-15th-graduation-booklet-2026",
        destination: "/admissions/graduation-booklets",
        permanent: true,
      },
      {
        source: "/admission",
        destination: "/admissions",
        permanent: true,
      },
      {
        source: "/our-programmes",
        destination: "/academics/programmes",
        permanent: true,
      },
      {
        source: "/schools_departments",
        destination: "/academics/schools",
        permanent: true,
      },
      {
        source: "/our-schools",
        destination: "/academics/schools",
        permanent: true,
      },
      {
        source: "/school/:slug",
        destination: "/academics/schools/:slug",
        permanent: true,
      },
      {
        source: "/dpt/:slug",
        destination: "/administration/units/:slug",
        permanent: true,
      },
      {
        source: "/A-Zdepartments",
        destination: "/az-index",
        permanent: true,
      },
      {
        source: "/A-ZClubs",
        destination: "/campus-life/clubs",
        permanent: true,
      },
      {
        source: "/campus_life",
        destination: "/campus-life",
        permanent: true,
      },
      {
        source: "/our_events",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/our_past_events",
        destination: "/events/past",
        permanent: true,
      },
      {
        source: "/event/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/news/:slug",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/w/blogs",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/library/library-website",
        destination: libraryFrontendUrl,
        permanent: true,
      },
      {
        source: "/research",
        destination: researchFrontendUrl,
        permanent: true,
      },
      {
        source: "/research/:path*",
        destination: withPath(researchFrontendUrl, "/:path*"),
        permanent: true,
      },
      {
        source: "/researc/:path*",
        destination: withPath(researchFrontendUrl, "/:path*"),
        permanent: true,
      },
      {
        source: "/visit_home",
        destination: "/visitors",
        permanent: true,
      },
      {
        source: "/page_downloads",
        destination: "/downloads",
        permanent: true,
      },
      {
        source: "/data_privacy_statement",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/m/staff",
        permanent: true,
      },
      {
        source: "/people/:personId",
        destination: "/staff/:personId",
        permanent: true,
      },
      {
        source: "/new_student_landing_page",
        destination: "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
        permanent: true,
      },
      {
        source: "/students/admissions/center",
        destination: "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kisiiuniversity.ac.ke",
      },
      {
        protocol: "https",
        hostname: "*.kisiiuniversity.ac.ke",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
