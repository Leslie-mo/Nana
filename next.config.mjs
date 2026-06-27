import { PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const createConfig = (phase) => ({
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ([PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase) ? ".next-build" : ".next"),
});

export default createConfig;
