"use client";

import React from "react";

export default function FooterSection() {
  return (
    <div className="scroll-overlay-section" data-section="footer">
      <div className="scroll-overlay-content">
        <div className="content-left-col">

          {/* Brand wordmark with decorative line */}
          <div className="section-meta-row mb-6">
            <p
              className="text-label"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Codezilla
            </p>
          </div>

          <h2
            className="text-section-title mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Guardians of<br />
            <span className="text-accent-blue">Innovation.</span>
          </h2>

          <p className="text-body-custom mb-10" style={{ maxWidth: "340px", lineHeight: "1.8" }}>
            We build extraordinary digital experiences — from AI platforms to cinematic web journeys.
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            {["About", "Expertise", "Solutions", "Contact"].map(link => (
              <span
                key={link}
                onClick={() => document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                className="text-btn-custom text-white/25 hover:text-white/60 transition-colors duration-300 cursor-pointer"
              >
                {link}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="accent-line w-32 mb-5" />

          <p className="text-body-custom text-white/20" style={{ fontSize: "10px" }}>
            © {new Date().getFullYear()} CodeZilla. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
