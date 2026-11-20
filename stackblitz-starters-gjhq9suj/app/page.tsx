"use client";

import React, { useState, useEffect, useRef } from "react";
import { STORY_ASSETS } from "./story-assets";

type NavTab =
  | "dashboard"
  | "journal"
  | "portfolio"
  | "community"
  | "opportunities"
  | "inbox"
  | "network";

interface BadgeItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
  category: string;
}

interface StoryCurvePoint {
  label: string;
  altitude: number;
}

interface PortfolioEntry {
  id: string;
  published: boolean;
  title: string;
  date: string;
  mile: number;
  trail: string;
  status: "final" | "draft";
  tags: string[];
  content: string;
  excerpt: string;
  curve: StoryCurvePoint[];
  strengths: string[];
  leadership: string[];
  badges: string[];
  summary: string;
  photos?: string[];
  collaborators?: Collaborator[];
}

interface Collaborator {
  name: string;
  note: string;
}

interface CommunityPost {
  id: string;
  author: string;
  major: string;
  isAlumni?: boolean;
  isCollaborative?: boolean;
  collabGoal?: string;
  category: "alumni" | "projects" | "advice" | "vent" | "fixit";
  tags: string[];
  title: string;
  content: string;
  cheers: number;
  time: string;
  userCheered: boolean;
  collaborators?: Collaborator[];
  comments: { author: string; text: string; time: string }[];
}

interface InboxMessage {
  id: string;
  sender: string;
  role: string;
  subject: string;
  date: string;
  unread: boolean;
  body: string;
}

interface KeywordInsight {
  keywords: string[];
  title: string;
  stat: string;
  resource: string;
  actionUrl?: string;
}

/* =========================================================
   GET CONNECTED: WORLDWIDE SAMPLE DATA & CONCENTRATION HUBS
   ========================================================= */

type ConnectType = "alumni" | "company" | "event" | "lab" | "faculty" | "org";

interface ConnectEntry {
  id: string;
  type: ConnectType;
  name: string;
  org: string;
  title: string;
  classYear?: string;
  hub: "atlanta" | "bayarea" | "seattle" | "nyc" | "austin" | "europe" | "asia" | "india";
  majors: string[];
  categories: string[];
  blurb: string;
  where: string;
  country: string;
}

type BoardType = "Internship" | "Part-time job" | "On-campus job" | "Co-op" | "Student organization" | "For fun";
type BoardLocation = "On campus" | "Atlanta (off campus)" | "Other city" | "Remote" | "Hybrid";
type BoardPay = "Paid" | "Stipend" | "Unpaid";

interface BoardPost {
  id: string;
  title: string;
  org: string;
  type: BoardType;
  majors: string[];
  location: BoardLocation;
  pay: BoardPay;
  payNote: string;
  blurb: string;
  posted: string;
  deadline: string;
}

interface WorldwideHub {
  id: ConnectEntry["hub"];
  label: string;
  short: string;
  region: string;
  connections: number;
  concentration: "Core" | "Very High" | "High" | "Medium-High" | "Medium";
  goldColor: string; // Darkening in gold depending on concentration
  x: number; // Percentage on SVG world map
  y: number;
}

const MAJORS = ["CS", "ECE", "ME", "BME", "ISyE", "AE", "Business"];
const WORK_CATEGORIES = [
  "Engineering",
  "Computer Science",
  "Research",
  "Campus Jobs",
  "Student Organizations",
  "Business & Finance",
  "Healthcare",
];
const BOARD_TYPES: BoardType[] = ["Internship", "Part-time job", "On-campus job", "Co-op", "Student organization", "For fun"];
const BOARD_LOCATIONS: BoardLocation[] = ["On campus", "Atlanta (off campus)", "Other city", "Remote", "Hybrid"];
const BOARD_PAYS: BoardPay[] = ["Paid", "Stipend", "Unpaid"];

const TYPE_META: Record<ConnectType, { label: string; icon: string; color: string }> = {
  alumni: { label: "Alumni", icon: "🎓", color: "#b3a369" },
  company: { label: "Companies", icon: "🏢", color: "#003057" },
  event: { label: "Events", icon: "📅", color: "#c59b27" },
  lab: { label: "Labs", icon: "🔬", color: "#2e7d32" },
  faculty: { label: "Faculty", icon: "👩‍🏫", color: "#4a5568" },
  org: { label: "Orgs & Campus Jobs", icon: "🐝", color: "#eaaa00" },
};

// Worldwide concentration hubs (darkening in gold with concentration)
const WORLDWIDE_HUBS: WorldwideHub[] = [
  { id: "atlanta", label: "Atlanta / Georgia Tech Core", short: "Atlanta (Core)", region: "North America", connections: 1420, concentration: "Core", goldColor: "#5c4302", x: 26.5, y: 39 },
  { id: "bayarea", label: "Silicon Valley / Bay Area", short: "Bay Area", region: "North America", connections: 840, concentration: "High", goldColor: "#856404", x: 19.5, y: 37 },
  { id: "nyc", label: "New York / Boston FinTech Hub", short: "NYC / Boston", region: "North America", connections: 620, concentration: "High", goldColor: "#9c7804", x: 29.5, y: 34 },
  { id: "seattle", label: "Seattle / Cloud Tech Corridor", short: "Seattle", region: "North America", connections: 490, concentration: "Medium-High", goldColor: "#b88e16", x: 19, y: 31 },
  { id: "austin", label: "Austin / Silicon Hills", short: "Austin, TX", region: "North America", connections: 380, concentration: "Medium", goldColor: "#cca025", x: 24, y: 41 },
  { id: "europe", label: "London / European Tech Hub", short: "London / EU", region: "Europe", connections: 310, concentration: "Medium", goldColor: "#cca025", x: 49.5, y: 28 },
  { id: "asia", label: "East Asia (Shenzhen, Tokyo, SG)", short: "East Asia", region: "Asia Pacific", connections: 460, concentration: "Medium-High", goldColor: "#b88e16", x: 81, y: 40 },
  { id: "india", label: "India (Bangalore, Hyderabad)", short: "India Hub", region: "South Asia", connections: 340, concentration: "Medium", goldColor: "#cca025", x: 68.5, y: 46 },
];

const CONNECT_DIRECTORY: ConnectEntry[] = [
  // Alumni (Real Georgia Tech Graduates)
  {
    id: "a0",
    type: "alumni",
    name: "Nathan Morlu",
    classYear: "ME '25",
    org: "BlackRock",
    title: "Mechanical Engineering Alumnus • BlackRock",
    hub: "atlanta",
    majors: ["ME"],
    categories: ["Engineering", "Business & Finance"],
    blurb: "On ME 2110: You have spent hours with this machine and are a subject matter expert. Make at least one friend in your major, and get into the Flowers Invention Studio!",
    where: "BlackRock Atlanta Innovation Hub / Midtown",
    country: "United States"
  },
  {
    id: "a_bratee",
    type: "alumni",
    name: "Bratee Podder",
    classYear: "CS '25",
    org: "AI Safety Initiative at Georgia Tech",
    title: "Operations Co-Director of AI Safety Initiative at Georgia Tech",
    hub: "atlanta",
    majors: ["CS"],
    categories: ["Computer Science", "Research"],
    blurb: "For lifestyle, especially if you're coming into university, find a few clubs that you like and join them in your first semester while you probably have the lightest and easiest workload of your time because not only do clubs provide a lot of networking opportunities but it also usually, if you join academic-related clubs or clubs to do with your career, it excels your understanding of the subject matter itself. I really enjoyed all of the club positions I've had. You'll be promoted because people leave in a semester so if you're the one to stay, you'll end up being the director of something which also looks pretty good :) And it's fun to do it's fun to learn how to manage things!",
    where: "Georgia Tech Campus / Tech Square",
    country: "United States"
  },
  {
    id: "a_mena",
    type: "alumni",
    name: "Mena Doce",
    classYear: "CS '26",
    org: "BlackRock",
    title: "Computer Science Undergraduate (Spring '26) • BlackRock Atlanta",
    hub: "atlanta",
    majors: ["CS"],
    categories: ["Computer Science", "Business & Finance"],
    blurb: "My biggest advice is to just put yourself out there and try new things. College goes by way faster than you think, so take advantage of every opportunity you get, meet as many people as you can, and don’t be afraid to step outside your comfort zone. Some of my best memories came from things I randomly decided to get involved in.",
    where: "BlackRock Atlanta Innovation Hub / Midtown",
    country: "United States"
  },
  {
    id: "a_mireya",
    type: "alumni",
    name: "Mireya Ramirez",
    classYear: "EAS '25",
    org: "Columbia University",
    title: "Ph.D. Student in Geological & Earth Sciences • Columbia University",
    hub: "nyc",
    majors: ["EAS", "BME", "CEE"],
    categories: ["Research", "Engineering"],
    blurb: "Don’t let your ambition overcome your joys, they should be intertwined. You can learn skills anywhere in this age, make sure you take the time to apply them to projects. Recognize your own failures and successes.",
    where: "Columbia University / Lamont-Doherty Earth Observatory, New York, NY",
    country: "United States"
  },
  { id: "a1", type: "alumni", name: "Marcus Chen", classYear: "ECE '21", org: "Apple (Tech Square Silicon Lab)", title: "Hardware Systems Architect", hub: "atlanta", majors: ["ECE", "ME"], categories: ["Engineering"], blurb: "Office hours available for Van Leer students debugging high-frequency circuits!", where: "0.8 miles away at Coda Building", country: "United States" },
  { id: "a2", type: "alumni", name: "Elena Rostova", classYear: "CS '18", org: "NCR Voyix (Midtown)", title: "Principal Machine Learning Eng", hub: "atlanta", majors: ["CS"], categories: ["Computer Science"], blurb: "Never let CS 1332 trees discourage you. Real AI engineering is about architecture and persistence.", where: "1.4 miles in Midtown", country: "United States" },
  { id: "a3", type: "alumni", name: "Sarah Lin", classYear: "CS '19", org: "Google DeepMind", title: "Research Scientist", hub: "bayarea", majors: ["CS", "ECE"], categories: ["Computer Science", "Research"], blurb: "Focus on core math in Klaus. Linear algebra pays off for decades in foundation models.", where: "Silicon Valley, CA (Alumni Mentor)", country: "United States" },
  { id: "a4", type: "alumni", name: "Jessica Taylor", classYear: "ME '18", org: "SpaceX / Starlink", title: "Senior Propulsion Engineer", hub: "bayarea", majors: ["ME", "AE"], categories: ["Engineering"], blurb: "ME 2110 is the closest course to actual rocket engine manufacturing. Cherish the pain.", where: "Hawthorne / Bay Area Hub", country: "United States" },
  { id: "a5", type: "alumni", name: "Devin Patel", classYear: "ISyE '20", org: "BlackRock & Two Sigma", title: "Quantitative Strategist", hub: "nyc", majors: ["ISyE", "CS", "Business"], categories: ["Business & Finance"], blurb: "Stochastic processes at Tech gave me the biggest competitive edge on Wall Street.", where: "New York FinTech Hub", country: "United States" },
  { id: "a6", type: "alumni", name: "Chloe Martinez", classYear: "BME '22", org: "Emory MedTech Incubator", title: "Biomedical Device Lead", hub: "atlanta", majors: ["BME"], categories: ["Healthcare", "Research"], blurb: "We are looking for undergrad research co-ops to test cardiovascular micro-catheters.", where: "3.1 miles (Emory / CDC corridor)", country: "United States" },
  { id: "a7", type: "alumni", name: "Alexander Wright", classYear: "CS '17", org: "DeepMind London", title: "Reinforcement Learning Staff Eng", hub: "europe", majors: ["CS", "ECE"], categories: ["Computer Science", "Research"], blurb: "Organizing GT alumni coffee sessions in Kings Cross London for students interning abroad.", where: "London, United Kingdom", country: "United Kingdom" },
  { id: "a8", type: "alumni", name: "Mei-Ling Zhang", classYear: "ECE '20", org: "TSMC / Global Silicon", title: "Principal Lithography Architect", hub: "asia", majors: ["ECE", "ME"], categories: ["Engineering"], blurb: "Happy to connect with Yellow Jackets traveling to Taiwan/Singapore for summer manufacturing co-ops.", where: "Hsinchu / Singapore", country: "Singapore" },
  { id: "a9", type: "alumni", name: "Arjun Natarajan", classYear: "ISyE '19", org: "Flipkart Supply Chain Labs", title: "Director of Operations Analytics", hub: "india", majors: ["ISyE", "CS"], categories: ["Business & Finance", "Engineering"], blurb: "Mentoring GT students interested in emerging global supply chains and optimization.", where: "Bangalore, India", country: "India" },
  
  // Real Companies That Hire Georgia Tech Students & Alumni (At least 5 verified partners)
  {
    id: "c_blackrock",
    type: "company",
    name: "BlackRock",
    org: "Hiring Partner: Tech Analysts & Co-ops",
    title: "Financial Engineering & Software Co-op",
    hub: "atlanta",
    majors: ["ME", "CS", "ISyE", "Business"],
    categories: ["Business & Finance", "Computer Science", "Engineering"],
    blurb: "Active recruiter of GT engineers for financial modeling, Aladdin platform development, and quantitative analysis. Nathan Morlu (ME '25) and fellow alumni mentor undergrads here.",
    where: "BlackRock Atlanta Innovation Hub, Midtown / NYC HQ",
    country: "United States"
  },
  {
    id: "c_apple",
    type: "company",
    name: "Apple Silicon Lab",
    org: "Hiring Partner: Hardware & Silicon Co-ops",
    title: "Custom Silicon & Hardware Architect Intern",
    hub: "atlanta",
    majors: ["ECE", "ME", "CS"],
    categories: ["Engineering", "Computer Science"],
    blurb: "Located right next to campus at Coda Tech Square. Designs Apple custom silicon. Marcus Chen (ECE '21) and hardware mentors host student office hours.",
    where: "0.8 miles away at Coda Building, Tech Square",
    country: "United States"
  },
  {
    id: "c_google",
    type: "company",
    name: "Google & Google DeepMind",
    org: "Hiring Partner: SWE & AI Research Interns",
    title: "Software Engineer & AI Co-op",
    hub: "atlanta",
    majors: ["CS", "ECE"],
    categories: ["Computer Science", "Research"],
    blurb: "Massive Midtown office on West Peachtree. Major campus hiring partner for AI research, cloud infrastructure, and search algorithms.",
    where: "1105 West Peachtree St NW, Midtown Atlanta",
    country: "United States"
  },
  {
    id: "c_delta",
    type: "company",
    name: "Delta Air Lines",
    org: "Hiring Partner: Operations & Fleet Co-ops",
    title: "Industrial & Fleet Optimization Co-op",
    hub: "atlanta",
    majors: ["ISyE", "ME", "AE", "CS"],
    categories: ["Engineering", "Business & Finance"],
    blurb: "World's leading airline headquartered right in Atlanta. Longstanding co-op pipeline for Georgia Tech ISyE optimization and Aerospace engineers.",
    where: "Delta Global Headquarters / Hartsfield-Jackson",
    country: "United States"
  },
  {
    id: "c_homedepot",
    type: "company",
    name: "The Home Depot",
    org: "Hiring Partner: Supply Chain & Cloud Engineers",
    title: "Enterprise Systems & Logistics Engineer",
    hub: "atlanta",
    majors: ["ISyE", "CS", "Business"],
    categories: ["Computer Science", "Engineering", "Business & Finance"],
    blurb: "Founded by GT alumni Arthur Blank and Bernie Marcus. Massive employer of Georgia Tech graduates across complex supply chain networks.",
    where: "Atlanta Technology Center / Paces Ferry",
    country: "United States"
  },
  {
    id: "c_ncr",
    type: "company",
    name: "NCR Voyix",
    org: "Hiring Partner: Machine Learning & Cloud",
    title: "Principal Machine Learning & Retail Systems Intern",
    hub: "atlanta",
    majors: ["CS", "Business", "ISyE"],
    categories: ["Computer Science", "Business & Finance"],
    blurb: "Headquartered directly across from Tech Square. Hires hundreds of Yellow Jackets across software engineering, machine learning, and fintech.",
    where: "864 Spring St NW, Tech Square",
    country: "United States"
  },
  {
    id: "c_microsoft",
    type: "company",
    name: "Microsoft Atlantic Yards",
    org: "Hiring Partner: Azure Cloud & Systems Co-ops",
    title: "Cloud & Systems Software Engineer",
    hub: "atlanta",
    majors: ["CS", "ECE", "ISyE"],
    categories: ["Computer Science", "Engineering"],
    blurb: "Campus partner situated at Atlantic Yards. Recruits GT undergraduates for cloud systems, AI dev tools, and enterprise architecture.",
    where: "Atlantic Yards (1.2 miles in Midtown)",
    country: "United States"
  },
  {
    id: "c_twosigma",
    type: "company",
    name: "Two Sigma",
    org: "Hiring Partner: Quantitative Researchers",
    title: "Quant Research & Modeling Analyst",
    hub: "nyc",
    majors: ["ISyE", "CS", "Business"],
    categories: ["Business & Finance", "Computer Science"],
    blurb: "Quantitative hedge fund hiring GT stochastic modeling and algorithms experts in New York.",
    where: "Soho / New York City",
    country: "United States"
  },
  { id: "c3", type: "company", name: "Bay Bridge Systems", org: "Hiring: New Grads", title: "Embedded Software Engineer", hub: "bayarea", majors: ["CS", "ECE"], categories: ["Computer Science", "Engineering"], blurb: "Referral-friendly team that loves Invention Studio and hackathon projects.", where: "San Jose, CA / Hybrid", country: "United States" },
  { id: "c4", type: "company", name: "Lakeside Cloud", org: "Hiring: Co-ops", title: "Cloud Infrastructure Co-op", hub: "seattle", majors: ["CS"], categories: ["Computer Science"], blurb: "Rotational co-op across storage, networking, and developer tools teams.", where: "Seattle, WA", country: "United States" },
  { id: "c5", type: "company", name: "Hudson Capital Group", org: "Hiring: Summer Analysts", title: "Quant Research Intern", hub: "nyc", majors: ["ISyE", "CS", "Business"], categories: ["Business & Finance"], blurb: "Strong probability + coding background wanted. Applications open this fall.", where: "New York, NY", country: "United States" },
  // Events
  { id: "e1", type: "event", name: "Hardware Career Mixer", org: "Tech Square Hosts", title: "Thursday • 6:00 PM", hub: "atlanta", majors: ["ECE", "ME", "AE"], categories: ["Engineering"], blurb: "Meet hardware recruiters and alumni over free food. Bring a prototype or sketch to show.", where: "Tech Square Ballroom", country: "United States" },
  { id: "e2", type: "event", name: "Fall Hackathon Kickoff", org: "Student Org Hosted", title: "Saturday • 10:00 AM", hub: "atlanta", majors: ["Any"], categories: ["Computer Science", "Student Organizations"], blurb: "Form teams, meet mentors, and pitch ideas. No experience required.", where: "CULC Atrium", country: "United States" },
  { id: "e3", type: "event", name: "Austin Alumni Meetup", org: "GT Alumni Association", title: "Next month", hub: "austin", majors: ["Any"], categories: ["Engineering", "Computer Science"], blurb: "Casual Silicon Hills meetup open to students visiting for interviews.", where: "Austin, TX", country: "United States" },
  // Labs
  { id: "l1", type: "lab", name: "Soft Robotics Lab", org: "Seeking: Undergrad Researchers", title: "Paid research assistant (10 hrs/wk)", hub: "atlanta", majors: ["ME", "ECE"], categories: ["Research", "Engineering"], blurb: "Help build pneumatic grippers. Training provided; CAD experience a plus.", where: "MRDC Building", country: "United States" },
  { id: "l2", type: "lab", name: "Human-Centered AI Lab", org: "Seeking: Research Assistants", title: "Research assistant / PURA", hub: "atlanta", majors: ["CS"], categories: ["Research", "Computer Science"], blurb: "Study how students interact with AI tutors. Python + user study interest.", where: "Klaus Advanced Computing", country: "United States" },
  { id: "l3", type: "lab", name: "Biosensing & Wearables Lab", org: "Seeking: Undergrad Researchers", title: "Wearables research position", hub: "atlanta", majors: ["BME", "ECE"], categories: ["Research", "Healthcare"], blurb: "Prototype low-cost sensors for tremor and gait monitoring.", where: "Petit Biotechnology Building", country: "United States" },
  // Faculty
  { id: "f1", type: "faculty", name: "Dr. A. Rahman", org: "Propulsion & Aerospace", title: "Offering: Paid summer research", hub: "atlanta", majors: ["AE", "ME"], categories: ["Research", "Engineering"], blurb: "Looking for sophomores/juniors interested in combustion testing. Email with transcript.", where: "Guggenheim Building", country: "United States" },
  { id: "f2", type: "faculty", name: "Prof. L. Nguyen", org: "Optimization & Operations", title: "Offering: Course TA + research", hub: "atlanta", majors: ["ISyE", "CS"], categories: ["Research", "Campus Jobs"], blurb: "Hiring undergrad TAs for next semester and one research assistant for routing models.", where: "Groseclose Building", country: "United States" },
  // Orgs & campus jobs
  { id: "o1", type: "org", name: "Ramblin' Robotics Club", org: "Student Organization", title: "Recruiting new members", hub: "atlanta", majors: ["Any"], categories: ["Student Organizations", "Engineering"], blurb: "Weekly build nights, no experience needed. Teams for mechanical, electrical, and software.", where: "Van Leer, 2nd Floor", country: "United States" },
  { id: "o2", type: "org", name: "Invention Studio Student Staff", org: "Campus Job", title: "Prototyping instructor (hourly)", hub: "atlanta", majors: ["ME", "ECE", "AE", "BME"], categories: ["Campus Jobs", "Engineering"], blurb: "Train other students on laser cutters and 3D printers. Flexible hours around classes.", where: "MRDC & Flowers Invention Studio", country: "United States" },
  { id: "o3", type: "org", name: "CULC Front Desk", org: "Campus Job", title: "Student assistant (hourly)", hub: "atlanta", majors: ["Any"], categories: ["Campus Jobs"], blurb: "Help students find study rooms and resources. Study during quiet shifts.", where: "Clough Commons", country: "United States" },
];

const BOARD_POSTS: BoardPost[] = [
  { id: "b1", title: "Summer Robotics Intern", org: "Tech Square Robotics Co.", type: "Internship", majors: ["ME", "ECE", "CS"], location: "Atlanta (off campus)", pay: "Paid", payNote: "$28/hr", blurb: "Build and test warehouse robot arms with a small hardware team.", posted: "2 days ago", deadline: "Dec 15" },
  { id: "b2", title: "Undergrad Research Assistant", org: "Soft Robotics Lab", type: "On-campus job", majors: ["ME", "ECE"], location: "On campus", pay: "Paid", payNote: "$16/hr, 10 hrs/wk", blurb: "Assemble and test pneumatic grippers. Training provided.", posted: "3 days ago", deadline: "Rolling" },
  { id: "b3", title: "Spring Data Science Co-op", org: "Peachtree Health Analytics", type: "Co-op", majors: ["BME", "ISyE", "CS"], location: "Hybrid", pay: "Paid", payNote: "$24/hr", blurb: "Six-month co-op analyzing patient flow data with Python and SQL.", posted: "1 week ago", deadline: "Dec 1" },
  { id: "b4", title: "Prototyping Instructor", org: "Invention Studio", type: "On-campus job", majors: ["ME", "ECE", "AE", "BME"], location: "On campus", pay: "Paid", payNote: "$15/hr", blurb: "Teach peers to use laser cutters and 3D printers safely.", posted: "4 days ago", deadline: "Nov 30" },
  { id: "b5", title: "New Member Build Nights", org: "Ramblin' Robotics Club", type: "Student organization", majors: ["Any"], location: "On campus", pay: "Unpaid", payNote: "Free to join", blurb: "Join a mechanical, electrical, or software subteam. Beginners welcome.", posted: "Today", deadline: "Open" },
  { id: "b6", title: "Quant Research Summer Analyst", org: "Hudson Capital Group", type: "Internship", majors: ["ISyE", "CS", "Business"], location: "Other city", pay: "Paid", payNote: "$9k/month", blurb: "Research trading signals with a small team in New York. Relocation help.", posted: "5 days ago", deadline: "Dec 20" },
  { id: "b7", title: "Weekend Board Game Cafe Crew", org: "GT Game Night Society", type: "For fun", majors: ["Any"], location: "On campus", pay: "Unpaid", payNote: "Free snacks", blurb: "Weekly casual game nights. Bring a friend or make a new one.", posted: "Yesterday", deadline: "Open" },
  { id: "b8", title: "Frontend Dev Part-Time", org: "Midtown Startup Collective", type: "Part-time job", majors: ["CS"], location: "Remote", pay: "Paid", payNote: "$30/hr, 12 hrs/wk", blurb: "Build React dashboards for a local nonprofit tech studio.", posted: "6 days ago", deadline: "Dec 5" },
  { id: "b9", title: "Wearables Research Position", org: "Biosensing & Wearables Lab", type: "Co-op", majors: ["BME", "ECE"], location: "On campus", pay: "Stipend", payNote: "$2,500 / semester", blurb: "Prototype low-cost tremor sensors alongside grad students.", posted: "1 week ago", deadline: "Dec 10" },
  { id: "b10", title: "Hackathon Volunteer Crew", org: "Fall Hackathon Kickoff", type: "Student organization", majors: ["CS", "ECE"], location: "On campus", pay: "Unpaid", payNote: "Meals + swag", blurb: "Help run check-in, mentoring tables, and demos for 300+ hackers.", posted: "2 days ago", deadline: "Nov 22" },
  { id: "b11", title: "Course TA: Optimization", org: "ISyE Department", type: "On-campus job", majors: ["ISyE", "CS"], location: "On campus", pay: "Stipend", payNote: "$1,800 / semester", blurb: "Hold office hours and grade problem sets for Spring.", posted: "3 days ago", deadline: "Dec 2" },
  { id: "b12", title: "Remote Embedded Software Co-op", org: "Bay Bridge Systems", type: "Co-op", majors: ["CS", "ECE"], location: "Remote", pay: "Paid", payNote: "$35/hr", blurb: "Write firmware tests for IoT devices from anywhere. Mentor assigned.", posted: "Yesterday", deadline: "Jan 5" },
];

const CAMPUS_RESOURCES = [
  { id: "r1", tag: "ACADEMIC EXCELLENCE", tagColor: "#b3a369", title: "Knack Tutoring & CULC Peer Tables", body: "Free 1-on-1 tutoring provided by Georgia Tech for CS, Math, Physics, and ME core classes.", place: "Clough Commons 2nd Floor", cta: "Book Free Tutor →", note: "Knack scheduler opened in new tab." },
  { id: "r2", tag: "WELLNESS & MENTAL HEALTH", tagColor: "#ba1c24", title: "Stamps Health & CARE", body: "Confidential mental health counselors, drop-in wellness coaching, and stress management.", place: "Smithgall Building", cta: "Contact CARE →", note: "Stamps CARE triage hours: Mon-Fri 8am-4pm." },
  { id: "r3", tag: "HANDS-ON MAKER SPACES", tagColor: "#2e7d32", title: "Flowers Invention Studio & The Hive", body: "Student-run makerspaces with 3D printers, laser cutters, electronics benches, and waterjets.", place: "MRDC & Van Leer", cta: "View Hours →", note: "Invention Studio training daily at 11am." },
  { id: "r4", tag: "CAREER & ALUMNI NETWORK", tagColor: "#003057", title: "GT Alumni Mentor Jackets", body: "Get paired 1-on-1 with a Georgia Tech alumnus working in your dream industry or field.", place: "GT Alumni Association", cta: "Request Mentor →", note: "Mentor Jackets matching period is active!" },
];

const matchesMajor = (majors: string[], selected: string) =>
  selected === "All majors" || majors.includes("Any") || majors.includes(selected);

const matchesCategory = (categories: string[], selected: string) =>
  selected === "All categories" || categories.includes(selected);

/* =========================================================
   PI MILE TRAIL: SCHEMATIC LOOP HELPERS
   ========================================================= */

const PI_MILE = 3.14;
const LOOP = { cx: 370, cy: 130, rx: 295, ry: 88 };

function loopPoint(f: number) {
  const t = -Math.PI / 2 + f * 2 * Math.PI;
  const wob = 1 + 0.1 * Math.sin(3 * t) + 0.06 * Math.cos(2 * t);
  return {
    x: LOOP.cx + LOOP.rx * wob * Math.cos(t),
    y: LOOP.cy + LOOP.ry * wob * Math.sin(t),
  };
}

function loopPath(from: number, to: number) {
  const n = Math.max(2, Math.ceil((to - from) / 0.01));
  let d = "";
  for (let i = 0; i <= n; i++) {
    const p = loopPoint(from + ((to - from) * i) / n);
    d += `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  return d;
}

const TRAIL_LANDMARKS = [
  { f: 0.0, icon: "🚩", label: "Start: Tech Green" },
  { f: 0.16, icon: "💻", label: "Klaus" },
  { f: 0.33, icon: "🐝", label: "Student Center" },
  { f: 0.5, icon: "⛲", label: "Campanile" },
  { f: 0.66, icon: "📚", label: "CULC" },
  { f: 0.83, icon: "🏰", label: "Tech Tower" },
];

export default function LittleStepsGT() {
  // Navigation: Default load screen is Journal
  const [activeTab, setActiveTab] = useState<NavTab>("journal");

  // =========================================================
  // ENTRY AUTHENTICATION (3 METHODS: STUDENT, ALUMNI, COMPANY)
  // =========================================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMethod, setAuthMethod] = useState<"student" | "alumni" | "company">("student");
  const [userRole, setUserRole] = useState<"student" | "alumni" | "company">("student");
  const [userName, setUserName] = useState("Alex K.");
  const [userAffiliation, setUserAffiliation] = useState("GT Undergrad - CS '27");

  // Student auth inputs
  const [studentEmail, setStudentEmail] = useState("akeller34@gatech.edu");
  const [studentCodeSent, setStudentCodeSent] = useState(false);
  const [studentVerificationCode, setStudentVerificationCode] = useState("");

  // Alumni auth inputs
  const [alumniName, setAlumniName] = useState("Marcus Chen");
  const [alumniGradYear, setAlumniGradYear] = useState("2021");
  const [alumniVerified, setAlumniVerified] = useState(false);

  // Company auth inputs
  const [companyName, setCompanyName] = useState("Tech Square Robotics");
  const [companyWebsite, setCompanyWebsite] = useState("techsquarerobotics.com");
  const [companyRepEmail, setCompanyRepEmail] = useState("recruiting@techsquarerobotics.com");

  // Journal State
  const [journalTitle, setJournalTitle] = useState("Reflections on ME 2110 & Staying Grounded");
  const [journalBody, setJournalBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Academics",
    "Stress",
  ]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Academics",
    "Stress",
    "Loneliness",
    "AI & ML",
    "Robotics",
    "CS",
    "ME",
    "Career",
    "Maker & Studio",
    "Wellness",
    "Friendship",
  ]);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMile, setCurrentMile] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // INLINE SUBMISSION & FEEDBACK (SCROLL DOWN, NOT A POPUP)
  const [isJournalSubmitted, setIsJournalSubmitted] = useState(false);
  const [currentEntryPublished, setCurrentEntryPublished] = useState(false);
  const feedbackSectionRef = useRef<HTMLDivElement | null>(null);

  // Collaborators in Journal
  const [journalCollaborators, setJournalCollaborators] = useState<Collaborator[]>([]);
  const [showCollabDrawer, setShowCollabDrawer] = useState(false);
  const [newCollabName, setNewCollabName] = useState("");
  const [newCollabNote, setNewCollabNote] = useState("");

  // Interactive Underlined Keyword Statistics & Resources Popups
  const [activeUnderlinePopup, setActiveUnderlinePopup] = useState<{
    id: "invention" | "lonely" | "stress" | "sleep";
    title: string;
    stat: string;
    linkUrl?: string;
    linkText?: string;
  } | null>(null);

  // Decision Modals State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAnonymous, setPublishAnonymous] = useState(false);
  const [isCollabPost, setIsCollabPost] = useState(true);
  const [collabGoal, setCollabGoal] = useState("Looking for 1 ECE student for motor controllers + 1 CS student for ROS2 firmware");
  const [publishCategory, setPublishCategory] = useState<"projects" | "advice" | "vent" | "fixit">("projects");

  // Join Collab Modal
  const [showJoinCollabModal, setShowJoinCollabModal] = useState(false);
  const [activeCollabPost, setActiveCollabPost] = useState<CommunityPost | null>(null);
  const [joinCollabName, setJoinCollabName] = useState("Alex K. (CS '27)");
  const [joinCollabNote, setJoinCollabNote] = useState("");

  // Request Mentorship / Email Modal (Clean Pure White Background)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("Dr. Sarah Vance (s.vance@gatech.edu)");
  const [emailSubject, setEmailSubject] = useState("[GT Student Update] Weekly Reflection & Progress");
  const [emailBody, setEmailBody] = useState("");

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Portfolio: visibility toggle (all vs published) + tag filters
  const [portfolioVisibility, setPortfolioVisibility] = useState<"all" | "published">("all");
  const [portfolioTagFilters, setPortfolioTagFilters] = useState<string[]>([]);

  // Community Board Filters: Category & Topic Sub-Tags
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState<string>("all");
  const [selectedTopicFilters, setSelectedTopicFilters] = useState<string[]>([]);

  // Get Connected: Section 1 (Google Map) filters & search
  const [mapType, setMapType] = useState<ConnectType>("alumni");
  const [mapMajor, setMapMajor] = useState<string>("All majors");
  const [mapCategory, setMapCategory] = useState<string>("All categories");
  const [mapHub, setMapHub] = useState<string>("atlanta");
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Get Connected: Section 3 (community board) filters
  const [boardMajor, setBoardMajor] = useState<string>("All majors");
  const [boardLocation, setBoardLocation] = useState<string>("All locations");
  const [boardPay, setBoardPay] = useState<string>("Any payment");
  const [boardType, setBoardType] = useState<string>("All types");

    // Walking Animation & Story Progression State
  const [walkingArtMode, setWalkingArtMode] = useState<"bee" | "custom_url" | "custom_upload" | "two_frame">("bee");
  const [customSpriteUrl, setCustomSpriteUrl] = useState<string>("");
  const [frame1Url, setFrame1Url] = useState<string>("");
  const [frame2Url, setFrame2Url] = useState<string>("");
  const [currentWalkFrame, setCurrentWalkFrame] = useState<1 | 2>(1);
  const [showArtModal, setShowArtModal] = useState<boolean>(false);

  // Story progression state for the walking animation scene
  const [storyProgression, setStoryProgression] = useState<"smooth" | "up" | "down" | "finale">("smooth");
  const [beeLeftPercent, setBeeLeftPercent] = useState<number>(5); // Starts on left side of the screen
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [flipFrame, setFlipFrame] = useState<1 | 2>(1);

  // Flipbook animation effect toggling between bee1 and bee2
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipFrame((prev) => (prev === 1 ? 2 : 1));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Bee starts at left (5%). After typing 5 words, bee walks to middle (48%) and stays there.
  // When finish is clicked, bee walks to Tech Tower (76%).
  useEffect(() => {
    const words = journalBody.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 5) {
      if (beeLeftPercent < 40 && storyProgression !== "finale") {
        setBeeLeftPercent(48);
      }
    } else {
      if (storyProgression !== "finale") {
        setBeeLeftPercent(5);
      }
    }
  }, [journalBody, storyProgression]);

  // Story progression analysis based on keywords (smooth, up = overcoming challenge, down = active suffering)
  useEffect(() => {
    if (storyProgression === "finale") return;
    const words = journalBody.trim().split(/\s+/).filter(Boolean).length;
    if (words < 5) {
      setStoryProgression("smooth");
      return;
    }
    const text = journalBody.toLowerCase();
    const downKeywords = [
      "lonely", "alone", "loneliness", "car", "hit by a car", "hospital", "pain",
      "crying", "suffering", "sad", "fail", "failed", "hurt", "exhausted", "hardest",
      "stress", "stressed", "overwhelmed", "hopeless", "dark", "injury", "struggle",
      "struggling", "setback", "anxious", "anxiety"
    ];
    const upKeywords = [
      "working hard", "work hard", "overcome", "challenge", "solved", "proud", "grow",
      "learned", "build", "fixed", "success", "study", "persevered", "hope", "accomplish",
      "victory", "passed", "breakthrough", "progress", "achieved", "win", "won"
    ];

    const neutralHappyKeywords = [
      "happy", "rich", "dog", "pet", "fun", "joy", "peace", "peaceful", "calm", "relax", "relaxing",
      "content", "chill", "coffee", "sunshine", "smile", "laugh", "great", "wonderful", "nice",
      "fine", "playing", "enjoy", "enjoying", "good", "wealth", "wealthy", "blessed", "normal"
    ];

    // Word-boundary matching prevents "hope" from matching inside "hopeless", etc.
    const matchWord = (kw: string) => new RegExp(`\\b${kw}\\b`).test(text);

    // Position-weighted scoring: keywords near the END of the text carry more weight
    // (a story that starts sad but ends hopeful should go uphill)
    const weightedScore = (keywords: string[]) => {
      let score = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, "g");
        let m;
        while ((m = regex.exec(text)) !== null) {
          // weight ranges from 0.5 (very start) to 1.5 (very end)
          score += 0.5 + (m.index / Math.max(text.length, 1));
        }
      }
      return score;
    };

    const downScore = weightedScore(downKeywords);
    const upScore = weightedScore(upKeywords);
    const hasNeutralHappy = neutralHappyKeywords.some(matchWord);

    // Compare position-weighted scores; neutral/happy boosts "up" in close ties
    if (downScore > 0 || upScore > 0) {
      const upBoost = hasNeutralHappy ? 0.3 : 0;
      if (upScore + upBoost > downScore) {
        setStoryProgression("up");
      } else if (downScore > upScore + upBoost) {
        setStoryProgression("down");
      } else {
        // True tie — lean uphill if ending is happy, downhill otherwise
        setStoryProgression(hasNeutralHappy ? "up" : "down");
      }
    } else if (hasNeutralHappy) {
      setStoryProgression("smooth");
    } else {
      setStoryProgression("smooth");
    }
  }, [journalBody, storyProgression]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("gt_walking_art_mode");
      const savedSprite = localStorage.getItem("gt_custom_sprite_url");
      const savedF1 = localStorage.getItem("gt_frame1_url");
      const savedF2 = localStorage.getItem("gt_frame2_url");
      if (savedMode) setWalkingArtMode(savedMode as any);
      if (savedSprite) setCustomSpriteUrl(savedSprite);
      if (savedF1) setFrame1Url(savedF1);
      if (savedF2) setFrame2Url(savedF2);
    }
  }, []);

  useEffect(() => {
    if (isTyping && walkingArtMode === "two_frame" && frame1Url && frame2Url) {
      const interval = setInterval(() => {
        setCurrentWalkFrame((prev) => (prev === 1 ? 2 : 1));
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isTyping, walkingArtMode, frame1Url, frame2Url]);

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "single" | "frame1" | "frame2") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === "single") {
        setCustomSpriteUrl(dataUrl);
        setWalkingArtMode("custom_upload");
      } else if (target === "frame1") {
        setFrame1Url(dataUrl);
      } else if (target === "frame2") {
        setFrame2Url(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

 // My Network Search Bar
  const [networkSearch, setNetworkSearch] = useState("");

  // Typing timer reference
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Campus Badge Icons Collection (8 distinct GT honors, no progression locks)
  const badgeCollection: BadgeItem[] = [
    { id: "b1", icon: "🐝", title: "Ramblin' Spirit", category: "Community", desc: "GT resilience & community" },
    { id: "b2", icon: "🔧", title: "Campus Fixer", category: "Maker & Service", desc: "Helping peers solder & debug" },
    { id: "b3", icon: "⛰️", title: "Freshman Hill", category: "Resilience", desc: "Overcoming tough STEM curves" },
    { id: "b4", icon: "💡", title: "Invention Maker", category: "Innovation", desc: "Prototyping in Invention Studio" },
    { id: "b5", icon: "📚", title: "Deep Learner", category: "Academics", desc: "Grasping technical concepts" },
    { id: "b6", icon: "🍵", title: "Mindful Wreck", category: "Wellness", desc: "Taking wellness & care breaks" },
    { id: "b7", icon: "🤝", title: "Mentor Link", category: "Mentorship", desc: "Connecting with alumni mentors" },
    { id: "b8", icon: "⚡", title: "Tech Innovator", category: "Engineering", desc: "Solving engineering challenges" },
  ];

  // Portfolio Archive with Narrative Progress Curves (Up/Down story charts)
  const [portfolioArchive, setPortfolioArchive] = useState<PortfolioEntry[]>([
    {
      id: "p1",
      published: true,
      title: "Overcoming the ME 2110 Midterm Review",
      date: "Nov 12, 2026",
      mile: 1.25,
      trail: "Tech Tower Loop",
      status: "final",
      tags: ["Academics", "Stress", "Maker & Studio", "ME"],
      content:
        "I was terrified of the mechatronics robot demo today. But after staying late at the Flowers Invention Studio and getting advice from a TA, the gear mechanism finally locked into place.",
      excerpt:
        "I was terrified of the mechatronics robot demo today. But after staying late at the Flowers Invention Studio and getting advice from a TA, the gear mechanism finally locked into place.",
      curve: [
        { label: "Overwhelm", altitude: 25 },
        { label: "Gear Short", altitude: 12 },
        { label: "Invention TA", altitude: 68 },
        { label: "Locked In", altitude: 94 },
      ],
      strengths: ["Resilience 94%", "Learner 88%"],
      leadership: ["Tenacity Under Pressure", "Resourcefulness"],
      badges: ["⛰️", "🔧", "🐝"],
      summary:
        "Faced severe anxiety over mechatronics gear tolerances. By seeking late-night assistance at Flowers Invention Studio, transformed confusion into a flawless mechanical demonstration, demonstrating grit and collaborative problem-solving.",
    },
    {
      id: "p2",
      published: true,
      title: "Finding My Footing on West Campus",
      date: "Nov 08, 2026",
      mile: 0.95,
      trail: "West Campus Commons",
      status: "final",
      tags: ["Friendship", "Wellness", "CS"],
      content:
        "Took a walk by West Village and sat down with two classmates from CS 1331. Realized everyone is just as nervous as I am about pointer arithmetic.",
      excerpt:
        "Took a walk by West Village and sat down with two classmates from CS 1331. Realized everyone is just as nervous as I am about pointer arithmetic.",
      curve: [
        { label: "Isolation", altitude: 30 },
        { label: "Self-Doubt", altitude: 20 },
        { label: "West Village Chat", altitude: 75 },
        { label: "Belonging", altitude: 88 },
      ],
      strengths: ["Relator 90%", "Empathy 85%"],
      leadership: ["Vulnerability & Belonging"],
      badges: ["🐝", "🍵"],
      summary:
        "Navigated acute imposter feelings by initiating a study discussion at West Village. Realizing fellow students shared identical pointer arithmetic fears fostered deep community and emotional resilience.",
    },
    {
      id: "p3",
      published: false,
      title: "Alumni Mentor Jackets First Call",
      date: "Oct 28, 2026",
      mile: 1.4,
      trail: "CULC to Campanile",
      status: "final",
      tags: ["Career", "Mentorship", "ECE"],
      content:
        "Spoke with Marcus Chen (EE '21). He gave me practical advice on how to structure my portfolio and not panic when applying to summer internships.",
      excerpt:
        "Spoke with Marcus Chen (EE '21). He gave me practical advice on how to structure my portfolio and not panic when applying to summer internships.",
      curve: [
        { label: "Career Fear", altitude: 35 },
        { label: "Resume Review", altitude: 55 },
        { label: "Industry Road", altitude: 82 },
        { label: "Clarity", altitude: 91 },
      ],
      strengths: ["Futuristic 82%", "Achiever 80%"],
      leadership: ["Proactive Growth", "Strategic Vision"],
      badges: ["🤝", "💡"],
      summary:
        "Connected with Marcus Chen (Apple / EE '21) to map out co-op recruitment. Received actionable critique on hardware portfolios and replaced job search panic with structured engineering milestones.",
    },
    {
      id: "p4",
      published: true,
      title: "Active Suffering: Tough Week & Setback on Ferst Drive",
      date: "Oct 15, 2026",
      mile: 0.8,
      trail: "Ferst Drive Crosswalk",
      status: "final",
      tags: ["Health", "Loneliness", "Vulnerability"],
      content:
        "Tough evening. Slipped on wet pavement near Tech Parkway, dropped my laptop, and felt completely isolated with midterm deadlines mounting.",
      excerpt:
        "Tough evening. Slipped on wet pavement near Tech Parkway, dropped my laptop, and felt completely isolated with midterm deadlines mounting.",
      curve: [
        { label: "High Hopes", altitude: 65 },
        { label: "Midterm Fatigue", altitude: 45 },
        { label: "Drop & Spill", altitude: 22 },
        { label: "Active Struggle", altitude: 14 },
      ],
      strengths: ["Empathy 85%", "Adaptability 75%"],
      leadership: ["Emotional Honesty"],
      badges: ["🌧️", "🩹"],
      summary:
        "Experienced an overwhelming day marked by feelings of loneliness and physical setback on Ferst Drive. Documenting this low point to track authentic emotional resilience through adversity.",
    },
  ]);

  // Community Posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: "c_alumni_nathan",
      author: "Nathan Morlu",
      major: "ME '25 (BlackRock)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["ME", "Makerspace", "Career", "Resilience"],
      title: "ME 2110, Major Friends & Flowers Invention Studio Advice",
      content:
        "On ME 2110: The design review feels daunting, but you have spent hours with this machine and are a subject matter expert. Judges and other students are genuinely interested in your work, so go out there and show the fruits of your labor.\n\nYou may feel lonely or lost at times, but there is always a light at the end of the tunnel. Make at least one friend in your major. It makes it much easier to navigate professors and courses, and in some cases can give you a study buddy.\n\nAdvice: Get into the flowers studio and try stuff out. From printing to laser cutting, the access they provide allows a freedom that you wish you had when working on personal projects.\n\nHelp others with their studies. It reinforces the material for you as well. Make sure to not “fix” the issues, but walk them towards a solution.\n\nIf you think 2110 is bad, brace yourself for systems lab and don't take machine design with Alpha… (Aside: you will learn why the gears you make in the training are breaking in machine design, don’t be discouraged)",
      cheers: 78,
      time: "1 hour ago",
      userCheered: false,
      collaborators: [],
      comments: [
        { author: "Alex K. (CS '27)", text: "Thank you Nathan! The Flowers Studio advice is so true.", time: "45 mins ago" },
      ],
    },
    {
      id: "c_alumni_bratee",
      author: "Bratee Podder",
      major: "CS '25 (Operations Co-Director, AI Safety Initiative at GT)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["CS", "AI & ML", "Student Organizations", "Career"],
      title: "Lifestyle & University Advice: Join Clubs Early & Learn to Manage",
      content:
        "For lifestyle, especially if you're coming into university, find a few clubs that you like and join them in your first semester while you probably have the lightest and easiest workload of your time because not only do clubs provide a lot of networking opportunities but it also usually, if you join academic-related clubs or clubs to do with your career, it excels your understanding of the subject matter itself. I really enjoyed all of the club positions I've had. You'll be promoted because people leave in a semester so if you're the one to stay, you'll end up being the director of something which also looks pretty good :) And it's fun to do it's fun to learn how to manage things!",
      cheers: 69,
      time: "2 hours ago",
      userCheered: false,
      collaborators: [],
      comments: [
        { author: "Freshman Buzz", text: "Joining AI Safety Initiative this week, thanks Bratee!", time: "1 hr ago" },
      ],
    },
    {
      id: "c_alumni_mena",
      author: "Mena Doce",
      major: "CS '26 (BlackRock in Atlanta)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["CS", "FinTech", "Career", "Wellness"],
      title: "Step Outside Your Comfort Zone & Meet People",
      content:
        "My biggest advice is to just put yourself out there and try new things. College goes by way faster than you think, so take advantage of every opportunity you get, meet as many people as you can, and don’t be afraid to step outside your comfort zone. Some of my best memories came from things I randomly decided to get involved in.",
      cheers: 55,
      time: "3 hours ago",
      userCheered: false,
      collaborators: [],
      comments: [],
    },
    {
      id: "c_alumni_mireya",
      author: "Mireya Ramirez",
      major: "Environmental Science '25 (Ph.D. at Columbia University)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["Research", "Wellness", "Academics"],
      title: "Intertwining Ambition & Joy: Lessons for Grad School & Beyond",
      content:
        "Don’t let your ambition overcome your joys, they should be intertwined.\nYou can learn skills anywhere in this age, make sure you take the time to apply them to projects.\nRecognize your own failures and successes.",
      cheers: 61,
      time: "5 hours ago",
      userCheered: false,
      collaborators: [],
      comments: [],
    },
    {
      id: "c_alumni_1",
      author: "Marcus Chen",
      major: "EE '21 (Apple Silicon Lab)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["ECE", "Hardware", "Career"],
      title: "From Van Leer late nights to Silicon Valley: What actually matters",
      content:
        "When I was an undergrad failing my first ECE 2026 quiz, I thought my career was over. Fast forward 5 years: industry managers care 10x more about your Invention Studio prototypes and hands-on debugging tenacity than a test grade. Keep pushing!",
      cheers: 64,
      time: "3 hours ago",
      userCheered: false,
      collaborators: [],
      comments: [
        { author: "Anonymous Buzz", text: "Needed to hear this today after physics quiz!", time: "2 hrs ago" },
      ],
    },
    {
      id: "c_collab_1",
      author: "Maya S. & Robotics Team",
      major: "CS '27 & ME '26",
      isAlumni: false,
      isCollaborative: true,
      collabGoal: "Looking for 1 ECE student for motor controllers + 1 ISyE for supply routing",
      category: "projects",
      tags: ["Robotics", "AI & ML", "CS", "ME", "Hardware"],
      title: "Autonomous Campus Quad Food Rover (Open for Collaborators!)",
      content:
        "We are engineering an open-source autonomous micro-rover to transport heavy mechanical parts between MRDC and Van Leer. CAD chassis is 80% finished. We need peers who want to collaborate on ROS2 path planning and PCB power distribution!",
      cheers: 47,
      time: "4 hours ago",
      userCheered: false,
      collaborators: [
        { name: "Alex K. (CS '27)", note: "Writing ROS2 navigation stack" },
        { name: "David R. (ME '26)", note: "Finished aluminum chassis milling in Invention Studio" },
      ],
      comments: [],
    },
    {
      id: "c_alumni_2",
      author: "Sarah Lin",
      major: "CS '19 (Google DeepMind)",
      isAlumni: true,
      isCollaborative: false,
      category: "alumni",
      tags: ["AI & ML", "CS", "Career"],
      title: "Research Advice: Transitioning from CS 1331 to Foundation Models",
      content:
        "If you want to do AI research, don't just memorize PyTorch wrappers. Spend time at the CULC understanding matrix factorizations and loss surfaces. If any student wants resume reviews for summer research, reply below!",
      cheers: 82,
      time: "6 hours ago",
      userCheered: false,
      collaborators: [],
      comments: [],
    },
    {
      id: "c_collab_2",
      author: "Chris Wong",
      major: "BME '25",
      isAlumni: false,
      isCollaborative: true,
      collabGoal: "Need 1 CS/AI peer for ECG signal classification",
      category: "projects",
      tags: ["BME", "AI & ML", "Healthcare"],
      title: "Wearable ECG Tremor Detector for Parkinson's (Need CS Lead)",
      content:
        "Developing a low-cost wearable sensory glove to detect tremors before motor freeze episodes. Hardware prototype is wired in The Hive. Seeking a CS teammate to train a lightweight Edge-ML classifier!",
      cheers: 38,
      time: "Yesterday",
      userCheered: false,
      collaborators: [
        { name: "Priya N. (ECE '26)", note: "Designing signal amplification circuit" },
      ],
      comments: [],
    },
    {
      id: "c3",
      author: "David R.",
      major: "Mechanical Eng '26",
      isAlumni: false,
      isCollaborative: false,
      category: "fixit",
      tags: ["ME", "Hardware"],
      title: "Van Leer Breadboard & Soldering troubleshooting tonight",
      content:
        "If your op-amp or 555 timer is smoking, come by Van Leer 2nd floor around 7pm. We will bring multimeters and spare jumper leads.",
      cheers: 22,
      time: "Yesterday",
      userCheered: false,
      collaborators: [],
      comments: [],
    },
  ]);

  // Campus Inbox
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([
    {
      id: "m1",
      sender: "Dr. Sarah Vance",
      role: "Faculty Advisor",
      subject: "Re: Academic Check-in & Spring Advising",
      date: "Today, 10:15 AM",
      unread: true,
      body:
        "Hello!\n\nI reviewed your recent reflection note. It is completely normal to feel stressed during ME 2110 design review weeks. Your CAD progress looks solid.\n\nLet's connect during office hours on Thursday to finalize your Spring courses.\n\nBest,\nDr. Vance",
    },
    {
      id: "m2",
      sender: "Marcus Chen (EE '21)",
      role: "Alumni Mentor",
      subject: "Hardware Portfolio & Interview Prep",
      date: "Yesterday",
      unread: false,
      body:
        "Saw your journal update! Happy to jump on a quick 20-min call this weekend to review your mechatronics CAD models before your co-op interviews.\n\nBest,\nMarcus",
    },
  ]);
  const [selectedInboxMessage, setSelectedInboxMessage] = useState<InboxMessage>(inboxMessages[0]);

  // Network Contacts Data
  const networkContacts = [
    {
      id: "net_nathan",
      name: "Nathan Morlu",
      role: "Alumni Mentor • Mechanical Engineering '25",
      dept: "ME",
      office: "BlackRock Atlanta Innovation Hub / Midtown",
      note: "On ME 2110: You have spent hours with this machine and are a subject matter expert. Make at least one friend in your major, and explore the Flowers Invention Studio!",
      email: "nathan.morlu@blackrock.com",
      avatar: "🐝",
      type: "Alumni Mentor",
    },
    {
      id: "net1",
      name: "Dr. Sarah Vance",
      role: "Faculty Advisor • Mechanical Engineering",
      dept: "ME",
      office: "MRDC 3102",
      note: "Office hours Thursdays 2-4pm in MRDC 3102.",
      email: "s.vance@gatech.edu",
      avatar: "👩‍🏫",
      type: "Faculty",
    },
    {
      id: "net2",
      name: "Marcus Chen (EE '21)",
      role: "Alumni Mentor • Hardware Systems at Apple",
      dept: "ECE",
      office: "Tech Square Coda",
      note: "Happy to look over your resume or chat about co-ops.",
      email: "marcus.chen.alumni@gatech.edu",
      avatar: "👨‍💼",
      type: "Alumni Mentor",
    },
    {
      id: "net3",
      name: "Maya Lin",
      role: "Knack Lead Tutor • CS 1331 & Discrete Math",
      dept: "CS",
      office: "CULC 2nd Floor Peer Tables",
      note: "Available Sundays for recursion, pointer arithmetic & data structures.",
      email: "maya.lin@knack.gatech.edu",
      avatar: "🧑‍💻",
      type: "Peer Tutor",
    },
    {
      id: "net4",
      name: "David R.",
      role: "Undergrad Research Peer • Soft Robotics Lab",
      dept: "ME",
      office: "Flowers Invention Studio Staff",
      note: "Build partner for ME 2110 actuator assemblies.",
      email: "david.r@gatech.edu",
      avatar: "🔧",
      type: "Student Peer",
    },
  ];

  // Trigger Notification Banner
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Handle Journal Textarea Typing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJournalBody(val);

    const words = val.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    setWordCount(count);

    const miles = +(Math.min(2.5, count * 0.007)).toFixed(2);
    setCurrentMile(miles);

    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1300);
  };

  // Toggle Tags
  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleAddCustomTag = () => {
    const promptVal = prompt("Enter custom tag (e.g., Coding, Finals, Robotics):");
    if (promptVal && promptVal.trim()) {
      const clean = promptVal.trim().replace(/^#/, "");
      if (!availableTags.includes(clean)) {
        setAvailableTags([...availableTags, clean]);
      }
      if (!selectedTags.includes(clean)) {
        setSelectedTags([...selectedTags, clean]);
      }
    }
  };

  // Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedPhotos([...attachedPhotos, file.name]);
      triggerNotification(`Attached photo: ${file.name}`);
    }
  };

  const removePhoto = (photoName: string) => {
    setAttachedPhotos(attachedPhotos.filter((p) => p !== photoName));
  };

  // Add Collaborator to Journal
  const handleAddCollaborator = () => {
    if (currentEntryPublished) {
      alert("This post has already been published. Collaboration cannot be altered on published entries.");
      return;
    }
    const name = newCollabName.trim();
    const note = newCollabNote.trim() || "Co-author";
    if (!name) {
      alert("Please enter your collaborator's name.");
      return;
    }
    setJournalCollaborators([...journalCollaborators, { name, note }]);
    setNewCollabName("");
    setNewCollabNote("");
    triggerNotification(`🤝 Added ${name} as a collaborator!`);
  };

  // Save for Later
  const handleSaveForLater = () => {
    if (!journalBody.trim()) {
      alert("Please write a few thoughts before saving a draft.");
      return;
    }

    const draftEntry: PortfolioEntry = {
      id: "draft_" + Date.now(),
      published: false,
      title: "Draft: " + (journalTitle.trim() || "Untitled Reflection"),
      date: "Today (Draft)",
      mile: currentMile || 0.35,
      trail: "Tech Tower Loop",
      status: "draft",
      tags: selectedTags.length ? selectedTags : ["Draft"],
      content: journalBody,
      excerpt: journalBody.slice(0, 140) + "...",
      curve: [
        { label: "Draft Start", altitude: 30 },
        { label: "Reflecting", altitude: 50 },
      ],
      strengths: ["Resilience 85%"],
      leadership: ["Active Introspection"],
      badges: ["🐝"],
      summary: "In-progress draft reflecting on semester challenges.",
      photos: attachedPhotos,
      collaborators: journalCollaborators,
    };

    setPortfolioArchive([draftEntry, ...portfolioArchive]);
    triggerNotification("💾 Draft saved! You can resume it anytime under My Portfolio.");
  };

  // ENTER & GET FEEDBACK (SCROLLS DOWN INSTEAD OF POPPING WINDOW OPEN)
  const handleSubmitForFeedback = () => {
    if (!journalBody.trim() || journalBody.trim().length < 20) {
      alert("Please write a bit more in your journal before generating an action plan and reflection feedback!");
      return;
    }

    setIsJournalSubmitted(true);
    setStoryProgression("finale");
    setBeeLeftPercent(76);
    setShowConfetti(true);
    triggerNotification("✨ Journal reflection complete! Buzz reached Tech Tower. Scroll down for your action plan.");

    // Smoothly scroll down to the feedback section directly below the journal
    setTimeout(() => {
      feedbackSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  // Save Feedback to Portfolio
  const handleSaveFeedbackToPortfolio = () => {
    const newEntry: PortfolioEntry = {
      id: "p_" + Date.now(),
      published: false,
      title: journalTitle.trim() || "GT Campus Reflection",
      date: "Today, Just now",
      mile: currentMile > 0 ? currentMile : 0.85,
      trail: "Tech Tower Loop",
      status: "final",
      tags: selectedTags.length ? selectedTags : ["Academics", "Resilience"],
      content: journalBody,
      excerpt: journalBody.slice(0, 160) + (journalBody.length > 160 ? "..." : ""),
      curve: [
        { label: "Initial Pressure", altitude: 25 },
        { label: "Doubt", altitude: 15 },
        { label: "Perseverance", altitude: 70 },
        { label: "Breakthrough", altitude: 94 },
      ],
      strengths: ["Resilience 94%", "Learner 88%"],
      leadership: ["Vulnerability & Self-Awareness", "Tenacity Under Pressure", "Resourcefulness"],
      badges: ["🐝", "⛰️", "💡", "🔧"],
      summary: "Navigated acute course pressure by pursuing peer maker support and persistent debugging.",
      photos: attachedPhotos,
      collaborators: journalCollaborators,
    };

    setPortfolioArchive([newEntry, ...portfolioArchive]);
    setCurrentEntryPublished(true);
    setActiveTab("portfolio");
    triggerNotification("✨ Saved to My Portfolio! Your visual story progress curve has been generated.");
  };

  // Confirm Publish
  const handleConfirmPublish = () => {
    const author = publishAnonymous ? "Anonymous Buzz" : userName || "Student Yellow Jacket (GT)";

    const newPost: CommunityPost = {
      id: "c_" + Date.now(),
      author: author,
      major: userAffiliation || "Georgia Tech Undergrad",
      isAlumni: userRole === "alumni",
      isCollaborative: isCollabPost,
      collabGoal: isCollabPost ? collabGoal : undefined,
      category: publishCategory,
      tags: ["Projects", "ME", "CS"],
      title: journalTitle || "Campus Project / Reflection",
      content: journalBody,
      cheers: 1,
      time: "Just now",
      userCheered: false,
      collaborators: journalCollaborators.length > 0 ? journalCollaborators : (isCollabPost ? [{ name: author, note: "Project Initiator" }] : []),
      comments: [],
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setShowPublishModal(false);
    setCurrentEntryPublished(true);
    setActiveTab("community");
    triggerNotification("💬 Reflection shared to GT Community Board!");
  };

  // Join Collaborative Post
  const handleJoinCollab = () => {
    if (!activeCollabPost) return;
    const name = joinCollabName.trim() || "GT Contributor";
    const note = joinCollabNote.trim() || "Joined project team";

    setCommunityPosts(
      communityPosts.map((p) => {
        if (p.id === activeCollabPost.id) {
          const currentCollabs = p.collaborators || [];
          return {
            ...p,
            collaborators: [...currentCollabs, { name, note }],
          };
        }
        return p;
      })
    );

    setShowJoinCollabModal(false);
    setJoinCollabNote("");
    triggerNotification(`🤝 Added ${name} as a co-author to "${activeCollabPost.title}"!`);
  };

  // Cheer on Community Post
  const handleCheerPost = (postId: string) => {
    setCommunityPosts(
      communityPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            cheers: p.userCheered ? p.cheers - 1 : p.cheers + 1,
            userCheered: !p.userCheered,
          };
        }
        return p;
      })
    );
  };

  // Topic filter toggle for Community Board
  const toggleTopicFilter = (topic: string) => {
    if (selectedTopicFilters.includes(topic)) {
      setSelectedTopicFilters(selectedTopicFilters.filter((t) => t !== topic));
    } else {
      setSelectedTopicFilters([...selectedTopicFilters, topic]);
    }
  };

  const beeProgressPercent = Math.min(85, 4 + (wordCount / 160) * 81);

  // ---------- Portfolio derived values ----------
  const totalMilesWalked = portfolioArchive.reduce((sum, p) => sum + p.mile, 0);
  const totalLaps = totalMilesWalked / PI_MILE;
  const fullLaps = Math.floor(totalLaps);
  const lapFraction = totalLaps - fullLaps;
  const milesToNextLap = (1 - lapFraction) * PI_MILE;
  const publishedCount = portfolioArchive.filter((p) => p.published).length;

  const usedTagCounts: Record<string, number> = {};
  portfolioArchive.forEach((p) => p.tags.forEach((t) => (usedTagCounts[t] = (usedTagCounts[t] || 0) + 1)));
  const usedTags = Object.entries(usedTagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const visibleEntries = portfolioArchive.filter((p) => {
    if (portfolioVisibility === "published" && !p.published) return false;
    if (portfolioTagFilters.length > 0 && !p.tags.some((t) => portfolioTagFilters.includes(t))) return false;
    return true;
  });

  const togglePortfolioTag = (tag: string) =>
    setPortfolioTagFilters((curr) => (curr.includes(tag) ? curr.filter((t) => t !== tag) : [...curr, tag]));

  const togglePublished = (id: string) => {
    const entry = portfolioArchive.find((p) => p.id === id);
    if (!entry) return;
    if (entry.status === "draft" && !entry.published) {
      triggerNotification("Finalize this draft before publishing it to the public.");
      return;
    }
    setPortfolioArchive(portfolioArchive.map((p) => (p.id === id ? { ...p, published: !p.published } : p)));
    triggerNotification(entry.published ? "🔒 Entry is now private." : "🌐 Entry published. It is now visible to the public.");
  };

  // ---------- Get Connected Google Maps derived values ----------
  const mapFiltered = CONNECT_DIRECTORY.filter(
    (e) =>
      e.type === mapType &&
      matchesMajor(e.majors, mapMajor) &&
      (mapCategory === "All categories" || e.categories.includes(mapCategory))
  );
  const hubCounts: Record<string, number> = {};
  mapFiltered.forEach((e) => (hubCounts[e.hub] = (hubCounts[e.hub] || 0) + 1));
  const mapVisible = mapFiltered.filter((e) => e.hub === mapHub);

  const getHubDefaultQuery = (hubId: string) => {
    switch (hubId) {
      case "atlanta":
        return "Georgia Institute of Technology, North Ave NW, Atlanta, GA 30332";
      case "bayarea":
        return "Silicon Valley, CA";
      case "nyc":
        return "New York, NY";
      case "seattle":
        return "Seattle, WA";
      case "austin":
        return "Austin, TX";
      case "europe":
        return "London, United Kingdom";
      case "asia":
        return "Hsinchu Science Park, Taiwan";
      case "india":
        return "Bangalore, Karnataka, India";
      default:
        return "Georgia Institute of Technology, Atlanta, GA";
    }
  };

  const activePin = mapVisible.find((e) => e.id === selectedPinId) || mapVisible[0];

  const mapSearchQuery = activePin
    ? `${activePin.where}, ${activePin.country || "USA"}`
    : getHubDefaultQuery(mapHub);

  const boardFiltered = BOARD_POSTS.filter(
    (p) =>
      matchesMajor(p.majors, boardMajor) &&
      (boardLocation === "All locations" || p.location === boardLocation) &&
      (boardPay === "Any payment" || p.pay === boardPay) &&
      (boardType === "All types" || p.type === boardType)
  );

  // Network Search Filter
  const filteredNetwork = networkContacts.filter((c) => {
    if (!networkSearch.trim()) return true;
    const q = networkSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.dept.toLowerCase().includes(q) ||
      c.note.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ffffff] text-[#003057] font-mono text-[15px]">
      {/* NOTIFICATION TOAST BANNER */}
      {notification && (
        <div className="fixed top-0 left-0 right-0 bg-[#003057] text-[#ffffff] px-4 py-2 text-xs font-bold border-b-2 border-[#b3a369] flex justify-between items-center z-50 shadow-md">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-[#b3a369] hover:text-white font-mono ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================
          ENTRY LOGIN MODAL (3 METHODS: STUDENT, ALUMNI, COMPANY)
          ======================================================== */}
      {!isLoggedIn && (
        <div className="fixed inset-0 bg-[#003057]/70 z-50 flex items-center justify-center p-4">
          <div className="pixel-modal bg-[#ffffff] border-4 border-[#b3a369] p-6 max-w-xl w-full shadow-[8px_8px_0_#003057] flex flex-col gap-4 text-[#003057]">
            <div className="border-b-2 border-[#b3a369] pb-3 text-center">
              <span className="text-3xl animate-bounce inline-block">🐝</span>
              <h2 className="text-sm font-black text-[#003057] mt-1">
                TECH'S BOOK
              </h2>
              <p className="text-xs text-[#594326] mt-1 m-0">
                Sign in to access your student reflections, verified mentorship, and worldwide campus networks.
              </p>
            </div>

            {/* 3 User Type Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 border-b-2 border-[#d4c492] pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMethod("student")}
                className={`p-2 border-2 text-center flex flex-col items-center gap-1 ${
                  authMethod === "student"
                    ? "bg-[#003057] text-[#ffffff] border-[#b3a369] shadow-[2px_2px_0_#b3a369]"
                    : "bg-[#ffffff] text-[#003057] border-[#d4c492] hover:bg-[#fcf9ee]"
                }`}
              >
                <span>🎓</span>
                <span className="text-[10px]">CURRENT STUDENT</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("alumni")}
                className={`p-2 border-2 text-center flex flex-col items-center gap-1 ${
                  authMethod === "alumni"
                    ? "bg-[#003057] text-[#ffffff] border-[#b3a369] shadow-[2px_2px_0_#b3a369]"
                    : "bg-[#ffffff] text-[#003057] border-[#d4c492] hover:bg-[#fcf9ee]"
                }`}
              >
                <span>🐝</span>
                <span className="text-[10px]">GT ALUMNI</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod("company")}
                className={`p-2 border-2 text-center flex flex-col items-center gap-1 ${
                  authMethod === "company"
                    ? "bg-[#003057] text-[#ffffff] border-[#b3a369] shadow-[2px_2px_0_#b3a369]"
                    : "bg-[#ffffff] text-[#003057] border-[#d4c492] hover:bg-[#fcf9ee]"
                }`}
              >
                <span>🏢</span>
                <span className="text-[10px]">COMPANY PARTNER</span>
              </button>
            </div>

            {/* METHOD 1: CURRENT STUDENT (@gatech.edu email with verification) */}
            {authMethod === "student" && (
              <div className="flex flex-col gap-3 bg-[#ffffff] p-3 border border-[#b3a369]">
                <strong className="text-xs font-black text-[#003057]">
                  GT Student Verification:
                </strong>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    GEORGIA TECH STUDENT EMAIL (@gatech.edu):
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g. gburdell3@gatech.edu"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>

                {!studentCodeSent ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!studentEmail.includes("@gatech.edu")) {
                        alert("Please enter a valid Georgia Tech email ending in @gatech.edu");
                        return;
                      }
                      setStudentCodeSent(true);
                      setStudentVerificationCode("188591");
                      triggerNotification("✉ Verification code sent to " + studentEmail);
                    }}
                    className="pixel-btn text-xs bg-[#003057] text-white"
                  >
                    Send GT Email Verification Code ➔
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#d4c492]">
                    <span className="text-[11px] text-[#2e7d32] font-bold">
                      ✓ One-time 6-digit verification code sent to your GT inbox!
                    </span>
                    <div>
                      <label className="text-[10px] font-bold text-[#003057] block">
                        ENTER 6-DIGIT VERIFICATION CODE:
                      </label>
                      <input
                        type="text"
                        value={studentVerificationCode}
                        onChange={(e) => setStudentVerificationCode(e.target.value)}
                        placeholder="188591"
                        className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoggedIn(true);
                        setUserRole("student");
                        setUserName("Alex K.");
                        setUserAffiliation("GT Undergrad - CS '27 (Verified @gatech.edu)");
                        triggerNotification("🎉 Welcome to Campus Connect, Alex!");
                      }}
                      className="pixel-btn text-xs bg-[#003057] text-white"
                    >
                      Verify & Enter Campus Connect ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: ALUMNI (Copy paste Name & Graduation Year, verified with Alumni Association) */}
            {authMethod === "alumni" && (
              <div className="flex flex-col gap-3 bg-[#ffffff] p-3 border border-[#b3a369]">
                <strong className="text-xs font-black text-[#003057]">
                  Georgia Tech Alumni Association Database Verification:
                </strong>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    FULL ALUMNI NAME:
                  </label>
                  <input
                    type="text"
                    value={alumniName}
                    onChange={(e) => setAlumniName(e.target.value)}
                    placeholder="e.g. Marcus Chen or George P. Burdell"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    YEAR OF GRADUATION:
                  </label>
                  <input
                    type="text"
                    value={alumniGradYear}
                    onChange={(e) => setAlumniGradYear(e.target.value)}
                    placeholder="e.g. 2021"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!alumniName.trim() || !alumniGradYear.trim()) {
                      alert("Please provide your name and graduation year.");
                      return;
                    }
                    setIsLoggedIn(true);
                    setUserRole("alumni");
                    setUserName(alumniName);
                    setUserAffiliation(`GT Alumnus - Class of '${alumniGradYear.slice(-2)} (Verified GT Alumni Assoc.)`);
                    triggerNotification(`🎓 Verified alumnus record for ${alumniName} (Class of ${alumniGradYear})!`);
                  }}
                  className="pixel-btn text-xs bg-[#003057] text-white"
                >
                  Verify With Alumni Association Database ➔
                </button>
              </div>
            )}

            {/* METHOD 3: COMPANY REPRESENTATIVE (Log in through company affiliated website) */}
            {authMethod === "company" && (
              <div className="flex flex-col gap-3 bg-[#ffffff] p-3 border border-[#b3a369]">
                <strong className="text-xs font-black text-[#003057]">
                  Company / Corporate Partner SSO Authentication:
                </strong>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    COMPANY / ORGANIZATION NAME:
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apple, Google, Tech Square Robotics"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    COMPANY AFFILIATED WEBSITE / DOMAIN:
                  </label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="e.g. techsquarerobotics.com or apple.com"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#003057] block">
                    REPRESENTATIVE CORPORATE WORK EMAIL:
                  </label>
                  <input
                    type="email"
                    value={companyRepEmail}
                    onChange={(e) => setCompanyRepEmail(e.target.value)}
                    placeholder="recruiting@techsquarerobotics.com"
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!companyWebsite.trim() || !companyName.trim()) {
                      alert("Please provide your company name and website domain.");
                      return;
                    }
                    setIsLoggedIn(true);
                    setUserRole("company");
                    setUserName(companyName + " Partner");
                    setUserAffiliation(`Verified Recruiter • ${companyWebsite}`);
                    triggerNotification(`🏢 Authenticated via ${companyWebsite}!`);
                  }}
                  className="pixel-btn text-xs bg-[#003057] text-white"
                >
                  Authenticate via Company Affiliated Website ➔
                </button>
              </div>
            )}

            {/* Bypass / Guest explore */}
            <div className="pt-2 border-t border-[#d4c492] flex justify-between items-center text-xs">
              <span className="text-[11px] text-[#594326]">
                Testing or exploring Georgia Tech Campus Connect?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLoggedIn(true);
                  setUserRole("student");
                  setUserName("Alex K. (GT Undergrad)");
                  setUserAffiliation("CS '27 • Yellow Jacket");
                  triggerNotification("Welcome! Exploring as Student Yellow Jacket.");
                }}
                className="text-xs font-bold text-[#003057] underline hover:text-[#b3a369]"
              >
                Continue as Guest Student ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SIDEBAR: EXACT ORDER REQUESTED:
          1. Dashboard
          2. Journal
          3. My Portfolio
          4. Community Board
          5. Opportunities (title: Get Connected)
          6. Inbox
          7. My Network
          ======================================================== */}
      <aside className="sidebar w-64 min-w-[250px] bg-[#eee3ca] border-r-3 border-[#80602f] p-4 flex flex-col justify-between select-none shadow-[2px_0_0_#d8c18e]">
        <div>
          <div
            className="flex items-center gap-3 mb-6 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-9 h-9 bg-[#003057] border-2 border-[#b3a369] shadow-[2px_2px_0_#594326] flex items-center justify-center text-[#eaaa00] font-black font-mono text-sm tracking-tighter select-none">GT</div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-[#594326] font-['Press_Start_2P']">
                TECH'S BOOK
              </h2>
              <p className="text-[11px] text-[#8c7857] font-bold">Georgia Tech Journey</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {/* 1. DASHBOARD */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "dashboard"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>⌂ Daily Trek</span>
            </button>

            {/* 2. JOURNAL (DEFAULT LOAD SCREEN) */}
            <button
              onClick={() => setActiveTab("journal")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "journal"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>✎ Tech Quest</span>
              <span
                className={`text-[8px] px-1.5 py-0.5 border font-['Press_Start_2P'] ${
                  isTyping
                    ? "bg-[#a98238] text-white border-[#594326] animate-pulse"
                    : "bg-[#2a2015] text-[#fffaf0] border-[#80602f]"
                }`}
              >
                {isTyping ? "WALKING" : "READY"}
              </span>
            </button>

            {/* 3. MY PORTFOLIO */}
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "portfolio"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>🗂️ Pathways</span>
              <span className="text-[8px] bg-[#6e5333] text-white px-1.5 py-0.5 font-['Press_Start_2P']">
                3
              </span>
            </button>

            {/* 4. COMMUNITY BOARD */}
            <button
              onClick={() => setActiveTab("community")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "community"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>💬 Community Board</span>
              <span className="text-[8px] bg-[#6e5333] text-white px-1.5 py-0.5 font-['Press_Start_2P']">
                5
              </span>
            </button>

            {/* 5. OPPORTUNITIES (TITLED GET CONNECTED) */}
            <button
              onClick={() => setActiveTab("opportunities")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "opportunities"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>⚑ Get Connected</span>
              <span className="text-[8px] bg-[#ad7b2b] text-white px-1.5 py-0.5 font-bold font-['Press_Start_2P']">
                MAP •
              </span>
            </button>

            {/* 6. INBOX */}
            <button
              onClick={() => setActiveTab("inbox")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "inbox"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>✉ Inbox</span>
              <span className="text-[8px] bg-[#b3473b] text-white px-1.5 py-0.5 font-['Press_Start_2P']">
                1
              </span>
            </button>

            {/* 7. MY NETWORK */}
            <button
              onClick={() => setActiveTab("network")}
              className={`nav-btn w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between border-2 ${
                activeTab === "network"
                  ? "bg-[#e5d2a6] border-[#a98238] shadow-[3px_3px_0_#c9ae78] text-[#594326]"
                  : "border-transparent bg-transparent text-[#806b4c] hover:bg-[#e5d2a6]/50 hover:border-[#a98238]/60"
              }`}
            >
              <span>👥 Affinity</span>
              <span className="text-[8px] bg-[#6e5333] text-white px-1.5 py-0.5 font-['Press_Start_2P']">
                {networkContacts.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-[#d8c18e]">
          {isLoggedIn ? (
            <div className="pixel-box p-2.5 text-xs text-[#594326] bg-[#fffaf0] border-2 border-[#d8c18e]">
              <strong className="font-bold block text-[10px] text-[#594326]">
                VERIFIED USER:
              </strong>
              <span className="text-[11px] text-[#3f301d] block font-bold truncate">
                {userName}
              </span>
              <span className="text-[9px] text-[#8c7857] block truncate">
                {userAffiliation}
              </span>
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="text-[9px] text-[#a98238] underline font-bold mt-1 block hover:text-[#594326]"
              >
                Switch Account / Sign In
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoggedIn(false)}
              className="pixel-btn text-[9px] py-1 bg-[#a98238] text-white text-center"
            >
              Sign In to Campus Connect
            </button>
          )}

          <div className="text-[12px] text-[#8c7857] text-left mt-1">
            <p className="font-['Press_Start_2P'] text-[8px] text-[#594326] mb-0.5">GEORGIA TECH</p>
            <p className="m-0 text-[#6e5a42]">Student Reflection & Space</p>
            <p className="m-0 mt-2 text-[11px] text-[#8c7857]">🔒 Reflections are stored securely.</p>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT VIEWPORT
          ======================================================== */}
      <main className="main-content flex-1 h-screen overflow-y-auto p-5 flex flex-col gap-4 bg-[var(--cream)]">
        {/* Top Header */}
        <header className="topbar flex justify-between items-center pb-2 border-b-2 border-[#d8c18e]">
          <div>
            <span className="text-[10px] tracking-widest text-[#a98238] font-bold">
              GEORGIA TECH • TECH'S BOOK
            </span>
            <h1 className="text-base font-black text-[#3f301d] mt-0.5">
              {activeTab === "dashboard" && "Dashboard & Overview"}
              {activeTab === "journal" && "Journal"}
              {activeTab === "portfolio" && "My Portfolio: Pi Mile Laps & Story Curves"}
              {activeTab === "community" && "Community Board & Collaborative Projects"}
              {activeTab === "opportunities" && "Get Connected: Map, Resources & Community Board"}
              {activeTab === "inbox" && "Campus Inbox & Advisor Messages"}
              {activeTab === "network" && "My Network: Mentors, Alumni & Peers"}
            </h1>
            <p className="text-xs text-[#6e5a42] mt-0.5 m-0">
              Reflect on your day, discover insights, and map your journey across Georgia Tech.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-[#e5d2a6] border-2 border-[#a98238] flex items-center justify-center text-xl shadow-[2px_2px_0_#80602f] cursor-pointer"
              onClick={() => setActiveTab("dashboard")}
              title="Georgia Tech Campus Connect"
            >
              🐝
            </div>
          </div>
        </header>

        {/* ========================================================
            PAGE 1: DASHBOARD (EXACT VISUAL MATCH TO SCREENSHOT)
            ======================================================== */}
        {activeTab === "dashboard" && (
          <section className="flex flex-col gap-4">
            <div className="pixel-box p-4 bg-[#fffaf0] border-2 border-[#d8c18e] shadow-[3px_3px_0_#dfcfb3] flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#a98238]">
                  DAILY OVERVIEW • GEORGIA TECH
                </span>
                <h2 className="text-sm font-black text-[#3f301d] mt-1 font-['Press_Start_2P']">
                  Ready for today's reflection?
                </h2>
                <p className="text-xs text-[#6e5a42] max-w-xl m-0">
                  Your bee is standing on the sidewalk. Jump into your Journal, start typing to begin walking, and explore campus paths.
                </p>
              </div>
              <button
                className="pixel-btn text-[#fffaf0] bg-[#a98238] border-2 border-[#594326] shadow-[2px_2px_0_#594326] hover:bg-[#8c6b29]"
                onClick={() => setActiveTab("journal")}
              >
                Start Journaling →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="pixel-box p-3 bg-[#fffaf0] border-2 border-[#d8c18e] shadow-[2px_2px_0_#dfcfb3]">
                <span className="text-[10px] text-[#a98238] font-bold block">
                  SAVED JOURNALS
                </span>
                <strong className="text-xl font-black text-[#2d2012]">
                  {portfolioArchive.filter((p) => p.status === "final").length} Entries
                </strong>
                <p className="text-[11px] text-[#7d6950] mt-1 m-0">
                  Archived in My Portfolio
                </p>
              </div>
              <div className="pixel-box p-3 bg-[#fffaf0] border-2 border-[#d8c18e] shadow-[2px_2px_0_#dfcfb3]">
                <span className="text-[10px] text-[#a98238] font-bold block">
                  CAMPUS MILES WALKED
                </span>
                <strong className="text-xl font-black text-[#2d2012]">
                  1.85 Miles
                </strong>
                <p className="text-[11px] text-[#7d6950] mt-1 m-0">
                  Along Ferst Dr & Tech Tower
                </p>
              </div>
              <div className="pixel-box p-3 bg-[#fffaf0] border-2 border-[#d8c18e] shadow-[2px_2px_0_#dfcfb3]">
                <span className="text-[10px] text-[#a98238] font-bold block">
                  COLLABORATIVE POSTS
                </span>
                <strong className="text-xl font-black text-[#2d2012]">
                  2 Active
                </strong>
                <p className="text-[11px] text-[#7d6950] mt-1 m-0">
                  On Community Board
                </p>
              </div>
            </div>

            {/* Campus Badge Icons Box */}
            <div className="pixel-panel p-4 bg-[#fffaf0] border-2 border-[#d8c18e] shadow-[3px_3px_0_#dfcfb3]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xs font-black text-[#3f301d] font-['Press_Start_2P']">
                    Campus Badge Icons Collection
                  </h2>
                  <p className="text-[11px] text-[#6e5a42] m-0">
                    Honors & themes representing character, resilience, and maker dedication:
                  </p>
                </div>
                <span className="text-[9px] font-bold text-[#594326] bg-[#eee3ca] px-2 py-0.5 border border-[#d8c18e]">
                  GT HONORS
                </span>
              </div>
              <div className="badge-icons-box p-3 bg-[#fcf7ec] border-2 border-[#d8c18e] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {badgeCollection.map((b) => (
                  <div key={b.id} className="badge-icon-item bg-[#fffaf0] border border-[#d8c18e] shadow-[1px_1px_0_#dfcfb3] p-2 flex flex-col items-center text-center">
                    <span className="emoji text-2xl mb-1">{b.icon}</span>
                    <strong className="text-[8px] font-black text-[#3f301d] mb-1">{b.title}</strong>
                    <small className="text-[11px] text-[#7d6950] leading-tight">{b.desc}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            PAGE 2: JOURNAL (WITH INLINE SCROLL FEEDBACK & UNDERLINED STATS)
            ======================================================== */}
        {activeTab === "journal" && (
          <section className="flex flex-col gap-4">
            {/* TOP PIXEL ART SCENE — LAYERED: sunset / skyline / grass+sidewalk / bee / tower / UI */}
            <div
              className="pixel-scene relative overflow-hidden border-2 border-[#b3a369] shadow-inner select-none"
              id="journal-scene"
              style={{ height: "220px" }}
            >
              {/* ── LAYER 1: Static sunset sky background ── */}
              <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${STORY_ASSETS.sunset})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* ── LAYER 2: Scrolling Atlanta skyline (parallax) ── */}
              {/* Uncropped: full 220px height, bottom: 0, showing full building tops and spires all the way to the bottom */}
              <div
                className="absolute inset-x-0 bottom-0 top-0 z-10 overflow-hidden pointer-events-none"
                style={{ height: "100%" }}
              >
                <div
                  className={`skyline-track flex h-full ${beeLeftPercent < 40 ? "paused" : ""}`}
                  style={{ width: "200%" }}
                >
                  <img
                    src={STORY_ASSETS.skyline}
                    alt="Atlanta Skyline"
                    className="w-1/2 h-full object-fill object-bottom"
                  />
                  <img
                    src={STORY_ASSETS.skyline}
                    alt="Atlanta Skyline"
                    className="w-1/2 h-full object-fill object-bottom"
                  />
                </div>
              </div>

              {/* ── LAYER 3: Sidewalk & Grass ── */}
              {/* Full width, 220px height, objectFit fill so grass takes bottom 26% and brick top edge is at exactly 79px */}
              <div
                className="absolute inset-x-0 z-20 pointer-events-none transition-all duration-700"
                style={{
                  height: "220px",
                  bottom: storyProgression === "smooth" || storyProgression === "finale" ? "0px" : "-10px",
                }}
              >
                <img
                  src={
                    storyProgression === "up"
                      ? STORY_ASSETS.sidewalkUp
                      : storyProgression === "down"
                      ? STORY_ASSETS.sidewalkDown
                      : STORY_ASSETS.sidewalkFlat
                  }
                  alt="Sidewalk & Lawn"
                  className="w-full h-full"
                  style={{ objectFit: "fill" }}
                />
              </div>

              {/* ── LAYER 4: Moving Bee — flipbook effect, feet touching brick edge ── */}
              <div
                className="scene-bee absolute z-30 pointer-events-none"
                style={{
                  left: `${beeLeftPercent}%`,
                  bottom: "79px",
                  transform:
                    storyProgression === "up"
                      ? "rotate(-18deg)"
                      : storyProgression === "down"
                      ? "rotate(18deg)"
                      : "rotate(0deg)",
                  transformOrigin: "50% 97%",
                  transition: "left 2.5s cubic-bezier(0.25, 1, 0.5, 1), transform 0.5s ease",
                  width: "56px",
                  height: "56px",
                }}
              >
                <img
                  src={flipFrame === 1 ? STORY_ASSETS.bee1 : STORY_ASSETS.bee2}
                  alt="Georgia Tech Walking Bee"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>

              {/* ── LAYER 5: Tech Tower End Goal (in front of skyline and ground, prominent on finale) ── */}
              <div
                className={`absolute transition-all duration-700 pointer-events-none ${
                  storyProgression === "finale" ? "opacity-100 scale-100" : "opacity-60 scale-95"
                }`}
                style={{
                  right: "3%",
                  bottom: "55px",
                  width: "100px",
                  height: "155px",
                  zIndex: 40,
                }}
              >
                <img
                  src={STORY_ASSETS.techTower}
                  alt="Georgia Tech Tower"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>

              {/* ── LAYER 6: Confetti Celebration Shower ── */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                  {Array.from({ length: 45 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: "-15px",
                        left: `${(i * 2.2) + ((i * 7) % 5)}%`,
                        width: `${6 + (i % 4)}px`,
                        height: `${9 + (i % 5)}px`,
                        backgroundColor: [
                          "#b3a369","#eaaa00","#003057","#ffffff",
                          "#e53e3e","#38a169","#805ad5","#3182ce",
                        ][i % 8],
                        transform: `rotate(${(i * 35) % 360}deg)`,
                        animation: `confetti-fall ${1.6 + ((i % 5) * 0.3)}s linear infinite`,
                        animationDelay: `${((i * 13) % 15) * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* ── LAYER 7: Top Scene Bar: Story Milestone & Manual Stage Selectors ── */}
              <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-50 flex-wrap gap-2 pointer-events-auto">
                <div className="bg-[#ffffff]/95 border border-[#b3a369] px-2.5 py-1 text-[10px] font-bold text-[#003057] flex items-center gap-1.5 shadow-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isTyping ? "bg-[#2e7d32] animate-ping" : "bg-[#b3a369]"
                    }`}
                  />
                  <span>
                    {storyProgression === "up" && "🧗 Uphill: Working hard to overcome challenge"}
                    {storyProgression === "down" && "🌧️ Downhill: Active suffering / tough moments"}
                    {storyProgression === "smooth" && "⛵ Horizontal: Smooth sailing on campus"}
                    {storyProgression === "finale" && "🏆 Finale: Reached Tech Tower!"}
                  </span>
                  <span className="text-[#8c7857]">• {wordCount} words</span>
                </div>

                {/* Story Stage Selector Chips */}
                <div className="flex items-center gap-1 bg-[#ffffff]/90 p-1 border border-[#b3a369] shadow-sm">
                  <span className="text-[9px] font-bold text-[#594326] px-1">STORY SCENE:</span>
                  {(["smooth", "up", "down"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setStoryProgression(mode);
                        setShowConfetti(false);
                        if (beeLeftPercent < 40) setBeeLeftPercent(48);
                      }}
                      className={`px-1.5 py-0.5 text-[9px] font-bold border transition-all ${
                        storyProgression === mode
                          ? "bg-[#003057] text-white border-[#003057]"
                          : "bg-[#ffffff] text-[#003057] border-[#b3a369] hover:bg-[#f7f0df]"
                      }`}
                      title={
                        mode === "smooth"
                          ? "Horizontal Sidewalk: Smooth sailing"
                          : mode === "up"
                          ? "Sidewalk Up: Working hard / challenge"
                          : "Sidewalk Down: Active suffering"
                      }
                    >
                      {mode === "smooth" ? "⛵ Smooth" : mode === "up" ? "🧗 Up" : "🌧️ Down"}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setStoryProgression("finale");
                      setBeeLeftPercent(76);
                      setShowConfetti(true);
                    }}
                    className={`px-1.5 py-0.5 text-[9px] font-bold border transition-all ${
                      storyProgression === "finale"
                        ? "bg-[#b3a369] text-[#003057] border-[#594326]"
                        : "bg-[#ffffff] text-[#003057] border-[#b3a369] hover:bg-[#f7f0df]"
                    }`}
                    title="Tech Tower Goal & Confetti"
                  >
                    🏁 Finish
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM JOURNAL EDITOR (VISIBLE DURING FEEDBACK SUMMARY AS WELL) */}
            <div className="pixel-panel relative flex flex-col gap-3 bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="border-b-2 border-[#b3a369] pb-2 flex justify-between items-center flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={journalTitle}
                  onChange={(e) => setJournalTitle(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-[#003057] focus:outline-none placeholder:text-[#8c7857] flex-1 min-w-[200px]"
                />
                {isJournalSubmitted && (
                  <span className="text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20] px-2 py-0.5 border border-[#2e7d32]">
                    ✓ REFLECTION PROCESSED • SCROLL DOWN FOR ACTION PLAN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#b3a369]">← TAGS:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`tag-chip ${
                        selectedTags.includes(tag) ? "selected" : ""
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  <button
                    onClick={handleAddCustomTag}
                    className="tag-chip secondary"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* JOURNAL TEXTAREA */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={journalBody}
                  onChange={handleTextChange}
                  placeholder="Type here... How are your classes going? Feeling stressed, overwhelmed, or lonely? Share your authentic thoughts."
                  className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-3 text-xs text-[#003057] focus:outline-none resize-none leading-relaxed placeholder:text-[#8c7857]"
                />
              </div>

              {/* COLLABORATOR ROSTER & INVITE BUTTON (ONLY ON UNPUBLISHED ENTRIES) */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#d4c492]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={currentEntryPublished}
                    onClick={() => {
                      if (currentEntryPublished) {
                        alert("This entry is already published. Collaboration is locked.");
                        return;
                      }
                      setShowCollabDrawer(!showCollabDrawer);
                    }}
                    className={`pixel-btn secondary text-xs ${
                      currentEntryPublished ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title={currentEntryPublished ? "Cannot add collaborators to published posts" : "Invite peers to co-author"}
                  >
                    🤝 {currentEntryPublished ? "Collaboration Locked (Published)" : (showCollabDrawer ? "Hide Collaborators ▲" : "+ Invite Collaborators ▼")}
                    {journalCollaborators.length > 0 && (
                      <span className="text-[9px] bg-[#b3a369] text-[#003057] px-1.5 py-0.2 ml-1 font-bold">
                        {journalCollaborators.length}
                      </span>
                    )}
                  </button>

                  {journalCollaborators.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-[#fcf9ee] border border-[#b3a369] px-2 py-0.5 text-[#003057] flex items-center gap-1"
                    >
                      <strong>{c.name}</strong> <span className="text-gray-500">({c.note})</span>
                      {!currentEntryPublished && (
                        <button
                          type="button"
                          onClick={() => setJournalCollaborators(journalCollaborators.filter((_, idx) => idx !== i))}
                          className="text-red-700 font-bold ml-1"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                </div>

                {currentEntryPublished && (
                  <span className="text-[10px] text-[#ba1c24] font-bold">
                    🔒 Post is published: collaboration disabled.
                  </span>
                )}
              </div>

              {/* COLLABORATOR INVITE DRAWER */}
              {showCollabDrawer && !currentEntryPublished && (
                <div className="p-3 bg-[#fcf9ee] border-2 border-[#b3a369] flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#003057]">
                    INVITE GEORGIA TECH PEER TO CO-AUTHOR THIS REFLECTION / PROJECT:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Collaborator Name & Major (e.g. Maya S., CS '27)"
                      value={newCollabName}
                      onChange={(e) => setNewCollabName(e.target.value)}
                      className="bg-[#ffffff] border border-[#b3a369] p-1.5 text-xs text-[#003057]"
                    />
                    <input
                      type="text"
                      placeholder="Role / Note (e.g. Debugged breadboard, CAD collaborator)"
                      value={newCollabNote}
                      onChange={(e) => setNewCollabNote(e.target.value)}
                      className="bg-[#ffffff] border border-[#b3a369] p-1.5 text-xs text-[#003057]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowCollabDrawer(false)}
                      className="pixel-btn secondary text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCollaborator}
                      className="pixel-btn text-xs bg-[#003057] text-white"
                    >
                      + Add Peer Collaborator
                    </button>
                  </div>
                </div>
              )}

              {/* ATTACHED PHOTOS */}
              {attachedPhotos.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap p-2 bg-[#fcf9ee] border border-[#b3a369]">
                  <span className="text-[10px] font-bold text-[#003057]">
                    ATTACHED PHOTOS:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {attachedPhotos.map((photo) => (
                      <span
                        key={photo}
                        className="text-[10px] bg-[#ffffff] border border-[#b3a369] px-2 py-0.5 text-[#003057] flex items-center gap-1"
                      >
                        📷 {photo}
                        <button
                          onClick={() => removePhoto(photo)}
                          className="text-red-700 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS (ENTER & GET FEEDBACK SCROLLS DOWN) */}
              <div className="flex justify-between items-center flex-wrap gap-2 pt-2 border-t-2 border-[#d4c492]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="pixel-btn secondary text-xs"
                  >
                    <span>📷 Photos</span>
                    <span className="text-[9px] bg-[#003057] text-white px-1 py-0.2">
                      {attachedPhotos.length}
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />

                  <button
                    onClick={handleSaveForLater}
                    className="pixel-btn secondary text-xs"
                  >
                    <span>💾 Save for Later</span>
                  </button>
                </div>

                <div>
                  <button
                    onClick={handleSubmitForFeedback}
                    className="pixel-btn text-xs bg-[#003057] text-white shadow-[3px_3px_0_#b3a369]"
                  >
                    <span>↵ Enter & Get Feedback ➔</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                INLINE FEEDBACK & LEADERSHIP SUMMARY (SCROLL-DOWN TARGET)
                JOURNAL ENTRY REMAINS FULLY VISIBLE WITH UNDERLINED KEYWORDS
                ======================================================== */}
            {isJournalSubmitted && (
              <div
                ref={feedbackSectionRef}
                id="journal-feedback-section"
                className="pixel-panel flex flex-col gap-5 border-3 border-[#b3a369] bg-[#ffffff] p-5 shadow-[4px_4px_0_#003057]"
              >
                {/* Header Banner */}
                <div className="flex justify-between items-start border-b-2 border-[#b3a369] pb-3 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#b3a369] uppercase tracking-wider block">
                      GEORGIA TECH NARRATIVE ANALYSIS & ACTION PLAN
                    </span>
                    <h2 className="text-sm font-black text-[#003057] mt-0.5 m-0">
                      Your Reflection, CliftonStrengths Domains & Alumni Insights
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20] px-2 py-0.5 border border-[#2e7d32]">
                      STATUS: ANALYZED
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="pixel-btn secondary text-[9px] py-0.5 px-2"
                    >
                      ▲ Back to Top
                    </button>
                  </div>
                </div>

                {/* 1. JOURNAL ENTRY DISPLAY WITH INTERACTIVE UNDERLINES */}
                <div className="bg-[#fcf9ee] border-2 border-[#b3a369] p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#003057] border-b border-[#d4c492] pb-1">
                    <span>📖 YOUR REFLECTION (CLICK UNDERLINED KEYWORDS FOR CAMPUS STATS & DIRECT LINKS):</span>
                    <span className="text-[#b3a369]">Click any wavy underline ▼</span>
                  </div>

                  <p className="text-xs text-[#003057] leading-relaxed m-0 font-sans">
                    {journalBody.trim().length > 0 ? (
                      <>
                        {journalBody.split(/\b/).map((chunk, idx) => {
                          const lower = chunk.toLowerCase();
                          if (lower === "lonely" || lower === "alone" || lower === "isolation") {
                            return (
                              <span
                                key={idx}
                                onClick={() =>
                                  setActiveUnderlinePopup({
                                    id: "lonely",
                                    title: "CAMPUS STATISTIC: STUDENT LONELINESS & BELONGING",
                                    stat: "Over 54% of Georgia Tech undergraduates report experiencing acute loneliness or isolation during their first two years. Tech Green student circles and peer groups meet weekly across campus.",
                                  })
                                }
                                className="journal-keyword-link"
                                title="Click to view loneliness statistics and connection resources"
                              >
                                {chunk}
                              </span>
                            );
                          }
                          if (lower === "invention" || lower === "studio" || lower === "flowers") {
                            return (
                              <span
                                key={idx}
                                onClick={() =>
                                  setActiveUnderlinePopup({
                                    id: "invention",
                                    title: "FLOWERS INVENTION STUDIO TRAINING & WORKSHOPS",
                                    stat: "Flowers Invention Studio is the world's largest student-run makerspace, completely free for all Georgia Tech students. Training sessions run daily at 11am.",
                                    linkUrl: "https://inventionstudio.gatech.edu/training",
                                    linkText: "Go to Flowers Invention Studio Training Site ➔",
                                  })
                                }
                                className="journal-keyword-link"
                                title="Click to view Invention Studio training info"
                              >
                                {chunk}
                              </span>
                            );
                          }
                          if (lower === "2110" || lower === "cad" || lower === "breadboard" || lower === "alpha") {
                            return (
                              <span
                                key={idx}
                                onClick={() =>
                                  setActiveUnderlinePopup({
                                    id: "coursework",
                                    title: "ME 2110 & STEM COURSEWORK INSIGHTS",
                                    stat: "ME 2110 Mechatronics design reviews test technical resilience. Alumni Nathan Morlu emphasizes: you are the subject matter expert on your machine!",
                                  })
                                }
                                className="journal-keyword-link"
                                title="Click to view ME 2110 coursework insights"
                              >
                                {chunk}
                              </span>
                            );
                          }
                          return <span key={idx}>{chunk}</span>;
                        })}
                      </>
                    ) : (
                      <>
                        Today felt overwhelming with the upcoming ME 2110 design review and CS 1331 quiz. I spent hours at the CULC feeling{" "}
                        <span
                          onClick={() =>
                            setActiveUnderlinePopup({
                              id: "lonely",
                              title: "CAMPUS STATISTIC: STUDENT LONELINESS & BELONGING",
                              stat: "Over 54% of Georgia Tech undergraduates report experiencing acute loneliness or isolation during their first two years. Tech Green student circles and peer groups meet weekly across campus.",
                            })
                          }
                          className="journal-keyword-link"
                        >
                          lonely and isolated
                        </span>
                        , questioning if I'm smart enough to keep up with the curve. But I pushed through the CAD assembly, wanted{" "}
                        <span
                          onClick={() =>
                            setActiveUnderlinePopup({
                              id: "invention",
                              title: "FLOWERS INVENTION STUDIO TRAINING & WORKSHOPS",
                              stat: "Flowers Invention Studio is the world's largest student-run makerspace, completely free for all Georgia Tech students. Training sessions run daily at 11am.",
                              linkUrl: "https://inventionstudio.gatech.edu/training",
                              linkText: "Go to Flowers Invention Studio Training Site ➔",
                            })
                          }
                          className="journal-keyword-link"
                        >
                          Flowers Invention Studio training
                        </span>{" "}
                        for gear fabrication, and helped another student debug their breadboard.
                      </>
                    )}
                  </p>
                </div>

                {/* INTERACTIVE UNDERLINE POPUP / EXPANDABLE DRAWER */}
                {activeUnderlinePopup && (
                  <div className="keyword-stat-box flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-[#b3a369] pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📊</span>
                        <strong className="text-xs font-black text-[#003057]">
                          {activeUnderlinePopup.title}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveUnderlinePopup(null)}
                        className="text-xs font-bold text-[#003057] hover:text-[#ba1c24]"
                      >
                        ✕ Close Stat Box
                      </button>
                    </div>

                    <p className="text-xs text-[#003057] leading-relaxed m-0">
                      {activeUnderlinePopup.stat}
                    </p>

                    {activeUnderlinePopup.id === "lonely" && (
                      <div className="flex gap-2 flex-wrap pt-2 border-t border-[#d4c492]">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUnderlinePopup(null);
                            feedbackSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="pixel-btn text-[9px] py-1 px-2.5 bg-[#003057] text-white"
                        >
                          🎯 Go to Action Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUnderlinePopup(null);
                            setActiveTab("community");
                            triggerNotification("Switched to Community Board. Browse peer posts and share!");
                          }}
                          className="pixel-btn secondary text-[9px] py-1 px-2.5"
                        >
                          💬 Visit Community Board
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveUnderlinePopup(null);
                            setActiveTab("opportunities");
                            triggerNotification("Switched to Affinity! Find peer orgs and mentorship.");
                          }}
                          className="pixel-btn secondary text-[9px] py-1 px-2.5"
                        >
                          🗺️ Explore Affinity
                        </button>
                      </div>
                    )}

                    {activeUnderlinePopup.linkUrl && (
                      <div className="pt-2 border-t border-[#d4c492] flex justify-end">
                        <a
                          href={activeUnderlinePopup.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="pixel-btn text-[9px] py-1 px-3 bg-[#003057] text-white no-underline inline-block"
                        >
                          {activeUnderlinePopup.linkText || "Open Training Portal ➔"}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DYNAMIC CLIFTONSTRENGTHS NARRATIVE ANALYSIS (GALLUP-ALIGNED) */}
                {(() => {
                  const text = (journalBody || "").toLowerCase();
                  const execWords = ["work", "hard", "cad", "solve", "solved", "fix", "fixed", "debug", "deadline", "deadlines", "exam", "test", "quiz", "task", "grind", "finish", "effort", "push", "2110", "machine", "breadboard", "build", "circuit"];
                  const relWords = ["friend", "friends", "lonely", "alone", "help", "helped", "helping", "peer", "peers", "study buddy", "teammate", "team", "together", "isolated", "major", "support", "collaborate", "dog", "pet", "happy"];
                  const stratWords = ["studio", "invention", "flowers", "laser", "print", "learn", "learned", "learning", "design", "alpha", "systems", "gear", "gears", "idea", "try", "explore", "analyze", "why", "curious"];
                  const infWords = ["review", "judges", "presentation", "present", "lead", "leading", "show", "fruits", "labor", "pitch", "explain", "rich", "success", "win", "proud", "accomplish"];

                  let execScore = execWords.filter((w) => text.includes(w)).length * 15 + 25;
                  let relScore = relWords.filter((w) => text.includes(w)).length * 15 + 20;
                  let stratScore = stratWords.filter((w) => text.includes(w)).length * 15 + 20;
                  let infScore = infWords.filter((w) => text.includes(w)).length * 15 + 15;

                  const total = execScore + relScore + stratScore + infScore;
                  const execPct = Math.round((execScore / total) * 100);
                  const relPct = Math.round((relScore / total) * 100);
                  const stratPct = Math.round((stratScore / total) * 100);
                  const infPct = 100 - (execPct + relPct + stratPct);

                  const domains = [
                    {
                      name: "EXECUTING",
                      pct: execPct,
                      color: "#594326",
                      bgBar: "bg-[#594326]",
                      theme: "Restorative & Achiever",
                      desc: "Tackles complex engineering roadblocks, debugs breadboard circuits, and sustains stamina through CAD deadlines.",
                    },
                    {
                      name: "RELATIONSHIP BUILDING",
                      pct: relPct,
                      color: "#1b5e20",
                      bgBar: "bg-[#1b5e20]",
                      theme: "Developer & Relator",
                      desc: "Recognizes campus loneliness, forms authentic study alliances, and walks peers toward their own solutions.",
                    },
                    {
                      name: "STRATEGIC THINKING",
                      pct: stratPct,
                      color: "#003057",
                      bgBar: "bg-[#003057]",
                      theme: "Learner & Ideation",
                      desc: "Drives hands-on inquiry at Flowers Invention Studio, rapidly prototyping gears and laser-cut assemblies.",
                    },
                    {
                      name: "INFLUENCING",
                      pct: infPct,
                      color: "#b3a369",
                      bgBar: "bg-[#b3a369]",
                      theme: "Communication & Self-Assurance",
                      desc: "Stands confident as subject matter expert during high-stakes ME 2110 faculty design reviews.",
                    },
                  ];

                  return (
                    <div className="bg-[#ffffff] border-2 border-[#b3a369] p-4 flex flex-col gap-3 shadow-sm">
                      <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#d4c492] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🧠</span>
                          <div>
                            <strong className="text-xs font-black text-[#003057] block">
                              CLIFTONSTRENGTHS® PROFILE (ACCURATELY DERIVED FROM YOUR STORY)
                            </strong>
                            <span className="text-[10px] text-[#2d4f6c]">
                              Gallup-aligned strengths domains calculated from your reflection vocabulary & emotional arc.
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-[#fcf9ee] border border-[#b3a369] px-2 py-0.5 text-[#594326]">
                          Top Domain: {domains.slice().sort((a, b) => b.pct - a.pct)[0].name} ({domains.slice().sort((a, b) => b.pct - a.pct)[0].pct}%)
                        </span>
                      </div>

                      {/* Domain Progress Bars */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {domains.map((dom) => (
                          <div key={dom.name} className="p-2.5 bg-[#fcf9ee] border border-[#d4c492] flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span style={{ color: dom.color }}>{dom.name}</span>
                              <span className="font-mono text-[#003057]">{dom.pct}%</span>
                            </div>
                            <div className="w-full bg-[#e2d6b5] h-2.5 overflow-hidden">
                              <div
                                className={`h-full ${dom.bgBar} transition-all duration-1000`}
                                style={{ width: `${dom.pct}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#003057] font-bold mt-0.5">
                              Key Themes: <span className="font-normal italic">{dom.theme}</span>
                            </div>
                            <p className="text-[10px] text-[#2d4f6c] m-0 leading-tight">
                              {dom.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. LEADERSHIP TRAITS DEMONSTRATED */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌟</span>
                    <h3 className="text-xs font-black text-[#003057] m-0">
                      LEADERSHIP SKILLS ASSIGNED FROM YOUR STORY:
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="pixel-box p-3 bg-[#ffffff] border-2 border-[#b3a369]">
                      <span className="text-[10px] font-bold text-[#b3a369] block mb-1">
                        1. TENACITY UNDER STEM PRESSURE
                      </span>
                      <p className="text-xs text-[#003057] m-0 leading-snug">
                        Maintained resolve through rigorous CAD tolerances and ME 2110 deadlines instead of withdrawing, turning acute course anxiety into execution.
                      </p>
                    </div>

                    <div className="pixel-box p-3 bg-[#ffffff] border-2 border-[#b3a369]">
                      <span className="text-[10px] font-bold text-[#b3a369] block mb-1">
                        2. AUTHENTIC VULNERABILITY & RESILIENCE
                      </span>
                      <p className="text-xs text-[#003057] m-0 leading-snug">
                        Acknowledged loneliness honestly. Vulnerability is the cornerstone of empathetic leadership and builds deep psychological safety on campus teams.
                      </p>
                    </div>

                    <div className="pixel-box p-3 bg-[#ffffff] border-2 border-[#b3a369]">
                      <span className="text-[10px] font-bold text-[#b3a369] block mb-1">
                        3. SERVANT LEADERSHIP & PEER COACHING
                      </span>
                      <p className="text-xs text-[#003057] m-0 leading-snug">
                        Stepped away from your own urgent project to help a peer troubleshoot their circuit breadboard, walking them toward a solution rather than taking over.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. ALUMNI ADVICE SPOTLIGHT: NATHAN MORLU (ME '25, BLACKROCK) */}
                <div className="bg-[#fcf9ee] border-3 border-[#b3a369] p-4 shadow-[3px_3px_0_#003057] flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3 border-b-2 border-[#b3a369] pb-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      {/* Tech Tower Sprite Profile Avatar */}
                      <div className="w-14 h-14 bg-[#ffffff] border-2 border-[#003057] p-1 flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                        <img
                          src={STORY_ASSETS.techTower}
                          alt="Tech Tower Profile Avatar"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#003057] m-0">Nathan Morlu</h4>
                          <span className="text-[9px] bg-[#003057] text-[#fffaf0] px-2 py-0.5 font-bold">
                            ALUMNI MENTOR MATCH
                          </span>
                        </div>
                        <p className="text-xs text-[#594326] font-bold m-0 mt-0.5">
                          B.S. Mechanical Engineering (GT Fall 2025) • BlackRock
                        </p>
                        <p className="text-[10px] text-[#2d4f6c] m-0">
                          Matched to your reflection based on ME 2110, makerspace prototyping, and peer collaboration.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailTo("Nathan Morlu (nathan.morlu@blackrock.com / GT Alumni)");
                        setEmailSubject("[Tech's Book Alumni Connect] Connecting on ME & Career Advice");
                        setEmailBody(`Hi Nathan,\n\nI read your advice on Tech's Book regarding ME 2110, Flowers Invention Studio, and navigating engineering courses. As a Georgia Tech student, I would love to connect and hear more about your transition to BlackRock!\n\nBest,\n${userName}`);
                        setShowEmailModal(true);
                      }}
                      className="pixel-btn text-[10px] py-1.5 px-3 bg-[#003057] text-white flex-shrink-0 shadow-sm"
                    >
                      ✉ Connect with Nathan Morlu
                    </button>
                  </div>

                  <div className="text-[10px] font-bold text-[#b3a369] uppercase tracking-wider">
                    ORGANIZED ALUMNI ADVICE FOR YOUR JOURNEY:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {/* Advice 1: ME 2110 */}
                    <div className="bg-[#ffffff] border border-[#b3a369] p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🤖</span>
                        <strong className="text-[11px] text-[#003057]">ON ME 2110 & DESIGN REVIEW:</strong>
                      </div>
                      <p className="text-xs text-[#2d4f6c] m-0 leading-relaxed italic">
                        "The design review feels daunting, but you have spent hours with this machine and are a subject matter expert. Judges and other students are genuinely interested in your work, so go out there and show the fruits of your labor."
                      </p>
                    </div>

                    {/* Advice 2: Community & Major Friends */}
                    <div className="bg-[#ffffff] border border-[#b3a369] p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🤝</span>
                        <strong className="text-[11px] text-[#003057]">ON COMMUNITY & MAKING FRIENDS:</strong>
                      </div>
                      <p className="text-xs text-[#2d4f6c] m-0 leading-relaxed italic">
                        "You may feel lonely or lost at times, but there is always a light at the end of the tunnel. Make at least one friend in your major. It makes it much easier to navigate professors and courses, and in some cases can give you a study buddy."
                      </p>
                    </div>

                    {/* Advice 3: Flowers Studio */}
                    <div className="bg-[#ffffff] border border-[#b3a369] p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">💡</span>
                        <strong className="text-[11px] text-[#003057]">FLOWERS STUDIO & PROTOTYPING:</strong>
                      </div>
                      <p className="text-xs text-[#2d4f6c] m-0 leading-relaxed italic">
                        "Advice: Get into the flowers studio and try stuff out. From printing to laser cutting, the access they provide allows a freedom that you wish you had when working on personal projects."
                      </p>
                    </div>

                    {/* Advice 4: Helping Peers with Studies */}
                    <div className="bg-[#ffffff] border border-[#b3a369] p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">📚</span>
                        <strong className="text-[11px] text-[#003057]">HELPING PEERS & REINFORCING MATERIAL:</strong>
                      </div>
                      <p className="text-xs text-[#2d4f6c] m-0 leading-relaxed italic">
                        "Help others with their studies. It reinforces the material for you as well. Make sure to not “fix” the issues, but walk them towards a solution."
                      </p>
                    </div>

                    {/* Advice 5: Systems Lab & Machine Design (Span 2 cols) */}
                    <div className="bg-[#ffffff] border border-[#b3a369] p-3 flex flex-col gap-1 shadow-sm md:col-span-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">⚠️</span>
                        <strong className="text-[11px] text-[#ba1c24]">ACADEMIC WARNING & GEAR LESSONS:</strong>
                      </div>
                      <p className="text-xs text-[#2d4f6c] m-0 leading-relaxed italic">
                        "If you think 2110 is bad, brace yourself for systems lab and don't take machine design with Alpha… (Aside: you will learn why the gears you make in the training are breaking in machine design, don’t be discouraged)"
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. AUTOMATED GT CAMPUS ACTION PLAN */}
                <div className="bg-[#ffffff] border-2 border-[#003057] p-4 flex flex-col gap-2.5 shadow-[3px_3px_0_#b3a369]">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <strong className="text-xs font-black text-[#003057]">
                      YOUR STEP-BY-STEP GT ACTION PLAN:
                    </strong>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-[#003057] leading-relaxed">
                    <div className="flex gap-2 items-start bg-[#fcf9ee] p-2 border border-[#d4c492]">
                      <strong className="text-[#003057]">STEP 1:</strong>
                      <span>
                        <strong>Book Knack Free Peer Tutoring:</strong> Reserve a 45-minute peer review at the CULC for CS 1331 pointer arithmetic.
                      </span>
                    </div>
                    <div className="flex gap-2 items-start bg-[#fcf9ee] p-2 border border-[#d4c492]">
                      <strong className="text-[#003057]">STEP 2:</strong>
                      <span>
                        <strong>Complete Makerspace Laser & CAD Checklist:</strong> Schedule Invention Studio machine training daily at 11am for gear tolerances.
                      </span>
                    </div>
                    <div className="flex gap-2 items-start bg-[#fcf9ee] p-2 border border-[#d4c492]">
                      <strong className="text-[#003057]">STEP 3:</strong>
                      <span>
                        <strong>Take a 20-Minute Mindful Walk on Tech Green:</strong> Reset dopamine and cognitive focus before continuing your evening study sprint.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. DEMONSTRATED BADGE HONORS */}
                <div>
                  <strong className="text-xs font-black text-[#003057] block mb-2">
                    🏅 BADGE HONORS EARNED FROM THIS REFLECTION:
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: "🐝", title: "Ramblin' Spirit", desc: "Peer solidarity & resilience" },
                      { icon: "⛰️", title: "Freshman Hill", desc: "Overcoming tough STEM curves" },
                      { icon: "💡", title: "Invention Maker", desc: "Prototyping & studio drive" },
                      { icon: "🔧", title: "Campus Fixer", desc: "Helping peers solder & debug" },
                    ].map((b) => (
                      <div key={b.title} className="badge-icon-item bg-[#ffffff]">
                        <span className="emoji">{b.icon}</span>
                        <strong>{b.title}</strong>
                        <small>{b.desc}</small>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. CONNECT TO MENTORS & CAMPUS RESOURCES */}
                <div className="flex flex-col gap-2 pt-2 border-t-2 border-[#b3a369]">
                  <strong className="text-xs font-black text-[#003057] flex items-center gap-1.5">
                    <span>🤝</span> CONNECT DIRECTLY TO MENTORS & GT ADVISORS:
                  </strong>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#ffffff] border-2 border-[#b3a369] flex justify-between items-center gap-3">
                      <div>
                        <strong className="text-xs text-[#003057] block">
                          Dr. Sarah Vance (Faculty Advisor)
                        </strong>
                        <span className="text-[10px] text-[#2d4f6c] block">
                          ME Department • Office Hours: Thurs 2-4pm MRDC
                        </span>
                        <span className="text-[10px] text-[#2e7d32] font-bold">
                          Available for course load & advising review
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTo("Dr. Sarah Vance (s.vance@gatech.edu)");
                          setEmailSubject("[GT Reflection Update] ME 2110 & Coursework Check-In");
                          setEmailBody(`Dear Dr. Vance,\n\nI just completed a reflection on my ME 2110 progress and would love to check in during office hours this Thursday.\n\nBest,\n${userName}`);
                          setShowEmailModal(true);
                        }}
                        className="pixel-btn text-[9px] py-1 px-2.5 bg-[#003057] text-white flex-shrink-0"
                      >
                        ✉ Request Advising
                      </button>
                    </div>

                    <div className="p-3 bg-[#ffffff] border-2 border-[#b3a369] flex justify-between items-center gap-3">
                      <div>
                        <strong className="text-xs text-[#003057] block">
                          Marcus Chen (ECE '21)
                        </strong>
                        <span className="text-[10px] text-[#2d4f6c] block">
                          Alumni Mentor • Hardware Architect at Apple
                        </span>
                        <span className="text-[10px] text-[#b3a369] font-bold">
                          Mentor Jackets • 0.8 mi away at Tech Square
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailTo("Marcus Chen (marcus.chen.alumni@gatech.edu)");
                          setEmailSubject("[Mentor Jackets] Advice on Mechatronics & Debugging");
                          setEmailBody(`Hi Marcus,\n\nI wrote a reflection about overcoming ME 2110 anxiety and debugging in the studio. Would love your perspective on how this translates to hardware industry interviews!\n\nBest,\n${userName}`);
                          setShowEmailModal(true);
                        }}
                        className="pixel-btn text-[9px] py-1 px-2.5 bg-[#003057] text-white flex-shrink-0"
                      >
                        ✉ Connect with Mentor
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Actions */}
                <div className="flex justify-between items-center flex-wrap gap-2 pt-3 border-t-2 border-[#d4c492]">
                  <button
                    onClick={handleSaveFeedbackToPortfolio}
                    className="pixel-btn text-xs bg-[#003057] text-white"
                  >
                    🗂️ Save to Pathways ➔
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="pixel-btn secondary text-xs"
                    >
                      💬 Share to Community Board
                    </button>
                    <button
                      onClick={() => {
                        setIsJournalSubmitted(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="pixel-btn secondary text-xs"
                    >
                      ✎ Edit Reflection
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================
            PAGE 3: MY PORTFOLIO
            ======================================================== */}
        {activeTab === "portfolio" && (
          <section className="flex flex-col gap-4">
            {/* ---------- PI MILE TRAIL MAP ---------- */}
            <div className="pixel-panel pi-trail-panel bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="flex justify-between items-start flex-wrap gap-2 border-b-2 border-[#b3a369] pb-2 mb-3">
                <div>
                  <h2 className="text-xs font-black text-[#003057] m-0">
                    🥧 PI MILE TRAIL: YOUR LAPS AROUND CAMPUS
                  </h2>
                  <p className="text-[11px] text-[#2d4f6c] m-0">
                    One lap of the Georgia Tech Pi Mile Trail is {PI_MILE} miles. Every journal walk adds to your lap count.
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#fcf9ee] text-[#003057] px-2 py-0.5 border border-[#b3a369]">
                  {totalMilesWalked.toFixed(2)} MILES TOTAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="lap-stat bg-[#ffffff] border-2 border-[#b3a369]">
                  <span className="lap-stat-label text-[#2d4f6c]">TIMES AROUND CAMPUS</span>
                  <span className="lap-stat-value text-[#003057]">{totalLaps.toFixed(2)}</span>
                  <span className="lap-stat-sub text-[#2d4f6c]">
                    {fullLaps} full {fullLaps === 1 ? "lap" : "laps"} + {Math.round(lapFraction * 100)}% of lap {fullLaps + 1}
                  </span>
                </div>
                <div className="lap-stat bg-[#ffffff] border-2 border-[#b3a369]">
                  <span className="lap-stat-label text-[#2d4f6c]">MILES TO NEXT LAP</span>
                  <span className="lap-stat-value text-[#003057]">{milesToNextLap.toFixed(2)}</span>
                  <span className="lap-stat-sub text-[#2d4f6c]">of {PI_MILE} mi per lap</span>
                </div>
                <div className="lap-stat bg-[#ffffff] border-2 border-[#b3a369]">
                  <span className="lap-stat-label text-[#2d4f6c]">LAP STAMPS</span>
                  <span className="lap-stat-value text-xl text-[#003057]">
                    {fullLaps > 0 ? Array.from({ length: Math.min(fullLaps, 8) }, () => "🐝").join(" ") : "—"}
                  </span>
                  <span className="lap-stat-sub text-[#2d4f6c]">one stamp per completed lap</span>
                </div>
              </div>

              <div className="relative bg-[#ffffff] border-2 border-[#b3a369] p-3 shadow-inner">
                <svg viewBox="0 0 740 260" className="w-full h-64 select-none">
                  <rect x="0" y="0" width="740" height="260" fill="#f8fafc" />
                  <ellipse cx={LOOP.cx} cy={LOOP.cy} rx={LOOP.rx * 0.62} ry={LOOP.ry * 0.55} fill="#edf7ed" stroke="#b3a369" strokeDasharray="3,3" />
                  <text x={LOOP.cx} y={LOOP.cy + 4} fontSize="10" textAnchor="middle" fontWeight="bold" fill="#003057">
                    GEORGIA TECH CAMPUS
                  </text>
                  <path d={loopPath(0, 1) + "Z"} fill="none" stroke="#64748b" strokeWidth="10" strokeDasharray="6,4" strokeLinejoin="round" />
                  {lapFraction > 0 && (
                    <path d={loopPath(0, lapFraction)} fill="none" stroke="#b3a369" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {TRAIL_LANDMARKS.map((lm) => {
                    const pt = loopPoint(lm.f);
                    const below = pt.y > LOOP.cy;
                    return (
                      <g key={lm.label}>
                        <circle cx={pt.x} cy={pt.y} r="11" fill="#ffffff" stroke="#003057" strokeWidth="2" />
                        <text x={pt.x} y={pt.y + 4} fontSize="11" textAnchor="middle">{lm.icon}</text>
                        <text x={pt.x} y={below ? pt.y + 27 : pt.y - 18} fontSize="9" textAnchor="middle" fontWeight="bold" fill="#003057">
                          {lm.label}
                        </text>
                      </g>
                    );
                  })}
                  <g transform={`translate(${loopPoint(lapFraction).x - 9}, ${loopPoint(lapFraction).y - 12})`}>
                    <text x="0" y="0" fontSize="22" className="gentle-bounce">🐝</text>
                  </g>
                </svg>
                <div className="flex justify-between items-center text-[10px] text-[#003057] mt-1.5 font-bold flex-wrap gap-1">
                  <span>🐝 You are {Math.round(lapFraction * 100)}% around lap {fullLaps + 1}</span>
                  <span className="text-[#2d4f6c] font-normal">Schematic route, not to scale</span>
                </div>
              </div>
            </div>

            {/* ---------- FILTER BAR ---------- */}
            <div className="portfolio-filter-bar bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-black text-[#003057] m-0">📖 My Journal Entries</h3>
                  <p className="text-[11px] text-[#2d4f6c] m-0">
                    Showing {visibleEntries.length} of {portfolioArchive.length} entries
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPortfolioVisibility("all")}
                    className={`pixel-btn text-xs ${portfolioVisibility === "all" ? "bg-[#003057] text-white" : "secondary"}`}
                  >
                    📚 All Entries ({portfolioArchive.length})
                  </button>
                  <button
                    onClick={() => setPortfolioVisibility("published")}
                    className={`pixel-btn text-xs ${portfolioVisibility === "published" ? "bg-[#003057] text-white" : "secondary"}`}
                  >
                    🌐 Published ({publishedCount})
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-[10px] font-bold text-[#b3a369]">FILTER BY TAG:</span>
                {usedTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => togglePortfolioTag(tag)}
                    className={`tag-chip ${portfolioTagFilters.includes(tag) ? "selected" : ""}`}
                  >
                    #{tag} <span className="opacity-70">({count})</span>
                  </button>
                ))}
                {portfolioTagFilters.length > 0 && (
                  <button onClick={() => setPortfolioTagFilters([])} className="text-[11px] underline font-bold text-[#b3a369]">
                    Clear tags
                  </button>
                )}
              </div>
            </div>

            {/* ---------- ALL JOURNAL ENTRIES ---------- */}
            <div className="flex flex-col gap-4">
              {visibleEntries.length === 0 && (
                <div className="pixel-panel text-xs text-[#2d4f6c]">
                  No entries match these filters yet. Try clearing a tag or switching back to All Entries.
                </div>
              )}
              {visibleEntries.map((story, idx) => {
                const points = story.curve || [
                  { label: "Start", altitude: 30 },
                  { label: "Low", altitude: 15 },
                  { label: "Work", altitude: 65 },
                  { label: "Resolution", altitude: 90 },
                ];
                const svgW = 600;
                const svgH = 110;
                const coords = points.map((pt, i) => {
                  const x = 50 + i * ((svgW - 100) / (points.length - 1));
                  const y = svgH - (pt.altitude / 100) * (svgH - 25);
                  return { x, y, label: pt.label, alt: pt.altitude };
                });
                const pathD = coords.reduce((acc, c, i) => {
                  if (i === 0) return `M ${c.x} ${c.y}`;
                  const prev = coords[i - 1];
                  const midX = (prev.x + c.x) / 2;
                  return `${acc} C ${midX} ${prev.y}, ${midX} ${c.y}, ${c.x} ${c.y}`;
                }, "");

                return (
                  <div
                    key={story.id}
                    className="pixel-box p-4 bg-[#ffffff] flex flex-col gap-3 border-2 border-[#b3a369] shadow-[3px_3px_0_#003057]"
                  >
                    <div className="flex justify-between items-start border-b-2 border-[#b3a369] pb-2 flex-wrap gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-[#b3a369] uppercase tracking-wider">
                          {story.status === "draft" ? "DRAFT ENTRY" : "STORY TRAJECTORY"} #{idx + 1} • {story.date}
                        </span>
                        <h3 className="text-sm font-black text-[#003057] mt-0.5">
                          {story.title}
                        </h3>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {story.tags.map((t) => (
                            <span key={t} className="mini-tag">#{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-[#fcf9ee] text-[#003057] px-2 py-0.5 border border-[#b3a369]">
                          🚩 {story.mile} MILES TRAVELED ({story.trail})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 border border-[#b3a369] ${
                            story.published ? "bg-[#e8f5e9] text-[#1b5e20]" : "bg-[#fcf9ee] text-[#003057]"
                          }`}
                        >
                          {story.published ? "🌐 PUBLIC" : "🔒 PRIVATE"}
                        </span>
                        <button
                          onClick={() => togglePublished(story.id)}
                          className="pixel-btn secondary text-[9px] py-0.5 px-2"
                        >
                          {story.published ? "Unpublish" : "Publish"}
                        </button>
                      </div>
                    </div>

                    {/* Visual Story Summary (Rain for negative progression stories, Rainbow for positive progression stories) */}
                    {(() => {
                      const isNegativeEnding = (() => {
                        if (story.curve && story.curve.length > 0) {
                          const last = story.curve[story.curve.length - 1];
                          const prev = story.curve[story.curve.length - 2] || last;
                          return last.altitude < prev.altitude || last.altitude < 40;
                        }
                        const t = (story.title + " " + story.excerpt).toLowerCase();
                        return t.includes("lonel") || t.includes("struggle") || t.includes("pain") || t.includes("fail") || t.includes("drop");
                      })();

                      return (
                        <div
                          className="relative border-2 border-[#b3a369] p-3 overflow-hidden shadow-inner"
                          style={{
                            backgroundImage: `url(${isNegativeEnding ? STORY_ASSETS.rain : STORY_ASSETS.rainbow})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Translucent overlay for crystal-clear readability */}
                          <div className="absolute inset-0 bg-[#ffffff]/80 backdrop-blur-[1px]" />

                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold text-[#003057] flex-wrap gap-2">
                              <span className="flex items-center gap-1.5">
                                <span className="text-base">{isNegativeEnding ? "🌧️" : "🌈"}</span>
                                <span>VISUAL STORY SUMMARY:</span>
                                <span
                                  className={`px-2 py-0.5 border font-bold text-[9px] ${
                                    isNegativeEnding
                                      ? "bg-[#dbe7ef] text-[#1b2d4f] border-[#7097a8]"
                                      : "bg-[#fef3c7] text-[#92400e] border-[#f59e0b]"
                                  }`}
                                >
                                  {isNegativeEnding
                                    ? "NEGATIVE PROGRESSION • Active Struggle / Downhill Slope"
                                    : "POSITIVE PROGRESSION • Overcoming & Victory / Uphill Slope"}
                                </span>
                              </span>
                              <span className="text-[9px] text-[#2d4f6c] bg-[#ffffff]/90 px-2 py-0.5 border border-[#b3a369]">
                                {isNegativeEnding ? "🌧️ Rain Summary Background" : "🌈 Rainbow Summary Background"}
                              </span>
                            </div>

                            <div className="relative w-full bg-[#ffffff]/90 border border-[#b3a369] p-1 shadow-inner">
                              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-28 select-none">
                                <defs>
                                  <linearGradient id={`curve-grad-react-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#b3a369" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#003057" stopOpacity="0.05" />
                                  </linearGradient>
                                </defs>
                                <line x1="30" y1="25" x2={svgW - 20} y2="25" stroke="#e2e8f0" strokeDasharray="3,3" />
                                <line x1="30" y1="55" x2={svgW - 20} y2="55" stroke="#e2e8f0" strokeDasharray="3,3" />
                                <line x1="30" y1="85" x2={svgW - 20} y2="85" stroke="#e2e8f0" strokeDasharray="3,3" />

                                <path
                                  d={`${pathD} L ${coords[coords.length - 1].x} ${svgH - 5} L ${coords[0].x} ${svgH - 5} Z`}
                                  fill={`url(#curve-grad-react-${idx})`}
                                />
                                <path d={pathD} fill="none" stroke="#b3a369" strokeWidth="4" strokeLinecap="round" />

                                {coords.map((c, i) => (
                                  <g key={i}>
                                    <circle cx={c.x} cy={c.y} r="5" fill="#003057" stroke="#b3a369" strokeWidth="2" />
                                    <text
                                      x={c.x}
                                      y={c.y > 40 ? c.y - 9 : c.y + 16}
                                      fontSize="8"
                                      fontWeight="bold"
                                      textAnchor="middle"
                                      fill="#003057"
                                    >
                                      {c.label} ({c.alt}%)
                                    </text>
                                  </g>
                                ))}
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-[#ffffff] border border-[#b3a369] p-2.5 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-[#b3a369] block mb-1">
                          🏅 BADGES EARNED PER STORY:
                        </span>
                        <div className="flex gap-1.5 flex-wrap my-1">
                          {story.badges.map((b) => (
                            <span key={b} className="text-base bg-[#fcf9ee] border border-[#b3a369] p-1 px-2">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#ffffff] border border-[#b3a369] p-2.5">
                        <span className="text-[9px] font-bold text-[#b3a369] block mb-1">
                          🧠 CLIFTONSTRENGTHS:
                        </span>
                        <div className="flex flex-col gap-1 mt-1 text-[10px]">
                          {story.strengths.map((s) => (
                            <div key={s} className="flex justify-between items-center bg-[#fcf9ee] px-1.5 py-0.5 border border-[#b3a369]">
                              <strong className="text-[#003057]">{s}</strong>
                              <span className="text-[#b3a369] font-bold">HIGH</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#ffffff] border border-[#b3a369] p-2.5 flex flex-col justify-between">
                        <span className="text-[9px] font-bold text-[#b3a369] block mb-1">
                          📍 CAMPUS TRAIL DATA:
                        </span>
                        <p className="text-xs font-bold text-[#003057] m-0">{story.trail}</p>
                        <div className="text-[10px] text-[#2d4f6c] mt-1">
                          Steps: ~{Math.round(story.mile * 2000)} • Elevation: Tech Hill
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#ffffff] border-2 border-[#b3a369] p-3 text-xs leading-relaxed">
                      <strong className="text-[10px] text-[#b3a369] block mb-0.5 uppercase font-black">
                        AI NARRATIVE REFLECTION SUMMARY:
                      </strong>
                      <p className="text-[#003057] m-0 italic">"{story.summary}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            PAGE 4: COMMUNITY BOARD
            ======================================================== */}
        {activeTab === "community" && (
          <section className="flex flex-col gap-4">
            <div className="pixel-panel flex justify-between items-center flex-wrap gap-3 bg-[#ffffff] border-2 border-[#b3a369]">
              <div>
                <h2 className="text-xs font-black text-[#003057]">
                  Georgia Tech Community Board
                </h2>
                <p className="text-[11px] text-[#2d4f6c] m-0">
                  Collaborative projects, peer advice, and direct insights from GT Alumni.
                </p>
              </div>
              <button
                className="pixel-btn text-white bg-[#003057]"
                onClick={() => setShowPublishModal(true)}
              >
                + Start Collaborative Post / Share
              </button>
            </div>

            {/* Category Filter Bar */}
            <div className="flex gap-2 border-b-2 border-[#b3a369] pb-2 text-xs flex-wrap items-center">
              <span className="text-[10px] font-bold text-[#b3a369]">CATEGORY:</span>
              {["all", "alumni", "collaborative", "projects", "advice", "fixit"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCommunityCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[11px] font-bold border ${
                    communityCategoryFilter === cat
                      ? "bg-[#003057] text-white border-[#003057]"
                      : "bg-[#ffffff] text-[#003057] border-[#d4c492] hover:bg-[#fcf9ee]"
                  }`}
                >
                  {cat === "all" ? "ALL POSTS" : cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Topic & Major Sub-Tags Bar */}
            <div className="flex gap-1.5 flex-wrap items-center bg-[#fcf9ee] border border-[#b3a369] p-2 text-xs">
              <span className="text-[10px] font-bold text-[#003057]">
                TOPIC & MAJOR FILTERS:
              </span>
              {["AI & ML", "Robotics", "CS", "ME", "ECE", "BME", "ISyE", "Hardware", "FinTech"].map(
                (topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopicFilter(topic)}
                    className={`tag-chip ${
                      selectedTopicFilters.includes(topic) ? "selected" : ""
                    }`}
                  >
                    #{topic}
                  </button>
                )
              )}
              {selectedTopicFilters.length > 0 && (
                <button
                  onClick={() => setSelectedTopicFilters([])}
                  className="text-[10px] text-[#003057] underline ml-auto font-bold"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Feed */}
            <div className="flex flex-col gap-3">
              {communityPosts
                .filter((post) => {
                  if (communityCategoryFilter === "alumni" && !post.isAlumni) return false;
                  if (communityCategoryFilter === "collaborative" && !post.isCollaborative) return false;
                  if (
                    communityCategoryFilter !== "all" &&
                    communityCategoryFilter !== "alumni" &&
                    communityCategoryFilter !== "collaborative"
                  ) {
                    if (post.category !== communityCategoryFilter) return false;
                  }
                  if (selectedTopicFilters.length > 0) {
                    const hasAll = selectedTopicFilters.every((t) =>
                      (post.tags || []).includes(t)
                    );
                    if (!hasAll) return false;
                  }
                  return true;
                })
                .map((post) => (
                  <div
                    key={post.id}
                    className={`pixel-box p-4 bg-[#ffffff] border-2 border-[#b3a369] shadow-[3px_3px_0_#003057] flex flex-col gap-2.5`}
                  >
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {post.isAlumni ? "🎓" : post.isCollaborative ? "🤝" : "🐝"}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-xs font-bold text-[#003057]">
                              {post.author}
                            </strong>
                            {post.isAlumni && (
                              <span className="bg-[#fcf9ee] text-[#003057] text-[9px] font-bold px-1.5 py-0.2 border border-[#b3a369]">
                                VERIFIED GT ALUMNUS
                              </span>
                            )}
                            {post.isCollaborative && (
                              <span className="bg-[#003057] text-white text-[9px] font-bold px-1.5 py-0.2 border border-[#b3a369]">
                                COLLABORATIVE PROJECT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#2d4f6c]">
                            {post.major} • {post.time}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-[#fcf9ee] border border-[#b3a369] px-2 py-0.5 text-[#003057] uppercase">
                        #{post.category}
                      </span>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {(post.tags || []).map((t) => (
                        <span
                          key={t}
                          className="text-[9px] bg-[#f8fafc] border border-[#b3a369] px-1.5 py-0.2 text-[#003057] font-bold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xs font-black text-[#003057] mt-0.5">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#003057] leading-relaxed m-0 font-sans">
                      {post.content}
                    </p>

                    {post.isCollaborative && (
                      <div className="bg-[#fcf9ee] border border-[#b3a369] p-2.5 my-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-[#003057]">
                            🤝 PROJECT COLLABORATORS & CO-AUTHORS:
                          </span>
                          <button
                            onClick={() => {
                              setActiveCollabPost(post);
                              setShowJoinCollabModal(true);
                            }}
                            className="pixel-btn text-[9px] py-1 px-2 bg-[#003057] text-white"
                          >
                            + Join as Collaborator
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-[#003057] m-0">
                          🎯 GOAL: {post.collabGoal || "Open to all peer contributions"}
                        </p>
                        <div className="flex flex-col gap-1 mt-1 text-[10px]">
                          {(post.collaborators || []).map((c, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center bg-[#ffffff] p-1 border border-[#d4c492]"
                            >
                              <strong className="text-[#003057]">{c.name}</strong>
                              <span className="text-[#2d4f6c] italic">{c.note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0] mt-1 text-xs">
                      <button
                        onClick={() => handleCheerPost(post.id)}
                        className="pixel-btn secondary text-[10px] py-1 px-2.5"
                      >
                        <span>{post.userCheered ? "❤️ Cheered" : "♡ Cheer"}</span>
                        <span className="font-bold">({post.cheers})</span>
                      </button>
                      {post.isAlumni ? (
                        <button
                          onClick={() => {
                            setEmailTo(`${post.author} (alumni@gatech.edu)`);
                            setEmailSubject(`[Alumni Mentorship] Connecting with ${post.author}`);
                            setEmailBody(`Dear ${post.author},\n\nI saw your post on the GT Community Board and would love to connect about your experiences...\n\nBest,\n${userName}`);
                            setShowEmailModal(true);
                          }}
                          className="pixel-btn text-[10px] py-1 px-2 bg-[#003057] text-white"
                        >
                          Request Mentorship ✉
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#2d4f6c]">
                          {(post.comments || []).length} supportive responses
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* ========================================================
            PAGE 5: OPPORTUNITIES (GET CONNECTED)
            WORLDWIDE CONNECTION MAP WITH GOOGLE MAPS API & GOLD CONCENTRATIONS
            ======================================================== */}
        {activeTab === "opportunities" && (
          <section className="flex flex-col gap-8">
            {/* ================= SECTION 1: GOOGLE MAPS CONNECTION DIRECTORY & CONCENTRATION CIRCLES ================= */}
            <div className="connect-section connect-map bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="section-banner map flex justify-between items-center flex-wrap gap-2 border-b-2 border-[#b3a369]">
                <div>
                  <span className="section-kicker text-[#b3a369]">SECTION 1 OF 3 • GRADUATE & HIRING CONCENTRATION</span>
                  <h2 className="text-[#003057]">🗺️ GEORGIA TECH CONCENTRATION MAP</h2>
                  <p className="text-[#2d4f6c]">
                    Live interactive Google Map of Georgia Tech alumni, partner companies, research labs, and student organizations. Cities are highlighted with concentration circles — the darker the color, the higher the concentration of Yellow Jackets and hiring partners!
                  </p>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {/* Who: type chips (NO ALL BUTTON, DEFAULT ALUMNI NETWORK FIRST) */}
                <div>
                  <label className="filter-label text-[#003057]">WHO ARE YOU LOOKING FOR? (CHOOSE NETWORK)</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(TYPE_META) as ConnectType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setMapType(t);
                          setSelectedPinId(null);
                        }}
                        className={`tag-chip ${mapType === t ? "selected" : ""}`}
                      >
                        {TYPE_META[t].icon} {TYPE_META[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Major + category of work */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#f8fafc] border-2 border-[#b3a369] p-3">
                  <div>
                    <label className="filter-label text-[#003057]">🎓 MAJOR</label>
                    <select value={mapMajor} onChange={(e) => setMapMajor(e.target.value)} className="filter-select">
                      <option>All majors</option>
                      {MAJORS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="filter-label text-[#003057]">🛠️ CATEGORY OF WORK</label>
                    <select value={mapCategory} onChange={(e) => setMapCategory(e.target.value)} className="filter-select">
                      <option>All categories</option>
                      {WORK_CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ========================================================
                    CITY & TOWN CONCENTRATION CIRCLES VISUALIZER
                    THE DARKER THE COLOR, THE MORE OF WHATEVER IS FILTERED
                    ======================================================== */}
                <div className="bg-[#fcf9ee] border-2 border-[#b3a369] p-3.5 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#d4c492] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📍</span>
                      <div>
                        <strong className="text-xs font-black text-[#003057] block">
                          GT CONCENTRATION BY CITY & TOWN (CLICK ANY CIRCLE TO CENTER MAP)
                        </strong>
                        <span className="text-[10px] text-[#2d4f6c]">
                          Circle color darkness and diameter scale directly with the density of matching {TYPE_META[mapType]?.label.toLowerCase()}.
                        </span>
                      </div>
                    </div>

                    {/* Concentration Darkness Legend */}
                    <div className="flex items-center gap-2 text-[9px] font-bold flex-wrap">
                      <span className="text-[#594326]">DENSITY:</span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#003057] border border-[#b3a369] inline-block" />
                        <span className="text-[#003057]">Very High (6+)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#7a5d00] inline-block" />
                        <span className="text-[#7a5d00]">High (3-5)</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-[#b88e16] inline-block" />
                        <span className="text-[#b88e16]">Moderate (1-2)</span>
                      </span>
                    </div>
                  </div>

                  {/* City Concentration Circles Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                    {[
                      {
                        id: "atlanta",
                        city: "Atlanta, GA",
                        corridor: "Midtown & Tech Square",
                        people: ["Nathan Morlu", "Bratee Podder", "Mena Doce", "Marcus Chen", "Elena Rostova", "Chloe Martinez"],
                        companies: ["BlackRock", "Apple Silicon", "Google", "Delta", "The Home Depot", "NCR Voyix", "Microsoft"],
                      },
                      {
                        id: "bayarea",
                        city: "San Francisco, CA",
                        corridor: "Silicon Valley Hub",
                        people: ["Sarah Lin", "Jessica Taylor"],
                        companies: ["Google DeepMind", "SpaceX", "Apple HQ", "Tesla"],
                      },
                      {
                        id: "nyc",
                        city: "New York, NY",
                        corridor: "Wall Street & Midtown",
                        people: ["Mireya Ramirez", "Devin Patel", "Nathan Morlu"],
                        companies: ["BlackRock Global HQ", "Two Sigma", "Bloomberg"],
                      },
                      {
                        id: "seattle",
                        city: "Seattle, WA",
                        corridor: "South Lake Union / Cloud",
                        people: ["Maya Patel"],
                        companies: ["Amazon HQ", "Microsoft Redmond"],
                      },
                      {
                        id: "austin",
                        city: "Austin, TX",
                        corridor: "Silicon Hills & Giga",
                        people: ["David Kim"],
                        companies: ["Tesla Giga Texas", "AMD", "Dell"],
                      },
                      {
                        id: "europe",
                        city: "London, UK",
                        corridor: "Kings Cross Tech Hub",
                        people: ["Alexander Wright"],
                        companies: ["DeepMind London", "Barclays Tech"],
                      },
                    ].map((hub) => {
                      // Calculate matching count for this city based on active filters
                      const matchingEntries = CONNECT_DIRECTORY.filter(
                        (entry) =>
                          entry.hub === hub.id &&
                          entry.type === mapType &&
                          matchesMajor(entry.majors, mapMajor) &&
                          matchesCategory(entry.categories, mapCategory)
                      );
                      const count = matchingEntries.length;
                      const isSelected = mapHub === hub.id;

                      // Dynamic color darkness based on count
                      let bgStyle = "bg-[#ffffff] text-[#594326] border-[#d4c492]";
                      let badgeColor = "bg-[#cbd5e1] text-[#334155]";
                      let badgeLabel = "0 in area";

                      if (count >= 6) {
                        bgStyle = "bg-[#003057] text-[#ffffff] border-[#eaaa00] shadow-md";
                        badgeColor = "bg-[#eaaa00] text-[#003057]";
                        badgeLabel = "Very High";
                      } else if (count >= 3) {
                        bgStyle = "bg-[#7a5d00] text-[#ffffff] border-[#594326] shadow-sm";
                        badgeColor = "bg-[#fffaf0] text-[#594326]";
                        badgeLabel = "High";
                      } else if (count >= 1) {
                        bgStyle = "bg-[#ecd599] text-[#003057] border-[#b3a369]";
                        badgeColor = "bg-[#003057] text-[#ffffff]";
                        badgeLabel = "Moderate";
                      }

                      return (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => {
                            setMapHub(hub.id);
                            setSelectedPinId(null);
                            setMapZoom(hub.id === "atlanta" ? 15 : 13);
                          }}
                          className={`p-2.5 flex flex-col items-center text-center transition-all cursor-pointer border-2 relative ${
                            isSelected ? "ring-2 ring-[#003057] scale-105" : "hover:scale-[1.02]"
                          } ${bgStyle}`}
                        >
                          {/* Circular Concentration Ring */}
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-black font-mono text-xs border-2 mb-1.5 transition-all ${
                              count >= 6
                                ? "bg-[#003057] border-[#eaaa00] text-[#eaaa00]"
                                : count >= 3
                                ? "bg-[#7a5d00] border-[#fffaf0] text-[#fffaf0]"
                                : count >= 1
                                ? "bg-[#b88e16] border-[#594326] text-[#ffffff]"
                                : "bg-[#f1f5f9] border-[#cbd5e1] text-[#94a3b8]"
                            }`}
                          >
                            {count}
                          </div>

                          <strong className="text-[11px] font-bold block leading-tight">
                            {hub.city}
                          </strong>
                          <span className="text-[9px] block opacity-85 mt-0.5">
                            {hub.corridor}
                          </span>

                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 mt-1.5 uppercase ${badgeColor}`}
                          >
                            {count} {mapType === "alumni" ? "Alumni" : mapType === "company" ? "Companies" : "Orgs"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GOOGLE MAPS EMBED CONTAINER */}
                <div className="relative bg-[#ffffff] border-2 border-[#b3a369] p-3 shadow-inner">
                  {/* Map Header Toolbar with Zoom & Controls */}
                  <div className="flex justify-between items-center text-xs bg-[#fdfbf6] p-2 border border-[#b3a369] mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#003057] flex items-center gap-1 text-[11px]">
                        <span>📍 Selected City:</span>
                        <span className="text-[#a98238] font-mono">
                          {WORLDWIDE_HUBS.find((h) => h.id === mapHub)?.label}
                        </span>
                      </span>
                      <span className="text-[10px] bg-[#003057] text-[#fffaf0] px-2 py-0.5 border border-[#594326] font-bold">
                        {mapVisible.length} {mapVisible.length === 1 ? "entry" : "entries"} found
                      </span>
                    </div>

                    {/* Interactive Zoom Controls */}
                    <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                      <span className="text-[#594326] font-bold">Zoom:</span>
                      <button
                        type="button"
                        onClick={() => setMapZoom(Math.max(3, mapZoom - 2))}
                        className="px-2 py-0.5 bg-[#ffffff] border border-[#b3a369] text-[#003057] font-bold hover:bg-[#f7f0df]"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <span className="font-mono text-[#003057] px-1 font-bold">{mapZoom}x</span>
                      <button
                        type="button"
                        onClick={() => setMapZoom(Math.min(19, mapZoom + 2))}
                        className="px-2 py-0.5 bg-[#ffffff] border border-[#b3a369] text-[#003057] font-bold hover:bg-[#f7f0df]"
                        title="Zoom In"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapZoom(16)}
                        className={`px-2 py-0.5 border text-[9px] font-bold ${mapZoom === 16 ? "bg-[#003057] text-white" : "bg-[#ffffff] text-[#003057] border-[#b3a369]"}`}
                      >
                        Campus (16x)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapZoom(13)}
                        className={`px-2 py-0.5 border text-[9px] font-bold ${mapZoom === 13 ? "bg-[#003057] text-white" : "bg-[#ffffff] text-[#003057] border-[#b3a369]"}`}
                      >
                        City (13x)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapZoom(6)}
                        className={`px-2 py-0.5 border text-[9px] font-bold ${mapZoom === 6 ? "bg-[#003057] text-white" : "bg-[#ffffff] text-[#003057] border-[#b3a369]"}`}
                      >
                        Region (6x)
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-[#003057] underline hover:text-[#a98238] font-bold text-[10px]"
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>
                  </div>

                  {/* EMBEDDED GOOGLE MAP IFRAME */}
                  <div className="w-full h-80 md:h-[400px] relative border border-[#b3a369] overflow-hidden bg-[#e5e3df] shadow-inner">
                    <iframe
                      title="Google Maps GT Network"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Bottom Active City Highlight */}
                  <div className="mt-2 p-2.5 bg-[#fcf9ee] border border-[#b3a369] flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{TYPE_META[mapType]?.icon || "📍"}</span>
                        <strong className="text-xs text-[#003057]">
                          Active Concentration Hub: {WORLDWIDE_HUBS.find((h) => h.id === mapHub)?.label}
                        </strong>
                        <span className="text-[10px] bg-[#003057] text-white px-2 py-0.5 font-bold">
                          {mapVisible.length} Verified Entries
                        </span>
                      </div>
                      <div className="text-[10px] text-[#2d4f6c] mt-0.5">
                        Scroll below to view real alumni mentors and verified hiring partner companies in this location.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Directory */}
                {mapVisible.length === 0 ? (
                  <div className="text-xs text-[#2d4f6c] bg-[#ffffff] border-2 border-dashed border-[#b3a369] p-4 text-center">
                    No matches here yet. Try another hub, major, or category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {mapVisible.map((entry) => {
                      const meta = TYPE_META[entry.type];
                      return (
                        <div id={`entry-${entry.id}`} key={entry.id} className="connect-card bg-[#ffffff] border-2 border-[#b3a369]" style={{ borderTopColor: meta.color }}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="type-badge" style={{ backgroundColor: meta.color }}>
                                  {meta.icon} {meta.label}
                                </span>
                                {entry.classYear && <span className="class-year-badge">{entry.classYear}</span>}
                              </div>
                              <h3 className="entry-name text-[#003057]">{entry.name}</h3>
                              <p className="entry-title text-[#2d4f6c]">{entry.title}</p>
                              <p className="entry-org text-[#594326] font-bold">{entry.org}</p>
                            </div>
                          </div>

                          <p className="entry-blurb text-[#003057] italic">"{entry.blurb}"</p>

                          <div className="entry-meta">
                            <span className="meta-pill text-[#003057] bg-[#f8fafc]">📍 {entry.where} ({entry.country})</span>
                            {entry.majors.map((m) => (
                              <span key={m} className="meta-pill text-[#003057] bg-[#f8fafc]">🎓 {m}</span>
                            ))}
                            {entry.categories.map((c) => (
                              <span key={c} className="meta-pill text-[#003057] bg-[#f8fafc]">🛠️ {c}</span>
                            ))}
                          </div>

                          <div className="entry-actions flex gap-2 pt-2 border-t border-[#d4c492]">
                            <button
                              type="button"
                              onClick={() => {
                                setEmailTo(`${entry.name} (${entry.org})`);
                                setEmailSubject(`[Tech's Book GT Network] Connecting regarding ${entry.title}`);
                                setEmailBody(`Hi ${entry.name},\n\nI found your profile on Tech's Book through the Georgia Tech Network Map. I am a student at Tech interested in ${entry.categories.join(", ")} and would love to connect!\n\nBest,\n${userName}`);
                                setShowEmailModal(true);
                              }}
                              className="pixel-btn text-xs bg-[#003057] text-white flex-1"
                            >
                              ✉ Connect
                            </button>
                            {entry.type === "company" && (
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(entry.name + " Georgia Tech co-op jobs")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="pixel-btn secondary text-xs text-center flex-1 no-underline"
                              >
                                💼 View Jobs ↗
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ================= SECTION 2: ALWAYS-OPEN RESOURCES ================= */}
            <div className="connect-section connect-resources bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="section-banner resources border-b-2 border-[#b3a369]">
                <span className="section-kicker text-[#b3a369]">SECTION 2 OF 3</span>
                <h2 className="text-[#003057]">🏛️ ALWAYS-OPEN CAMPUS RESOURCES</h2>
                <p className="text-[#2d4f6c]">Support programs that are available all year, no application or posting needed.</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {CAMPUS_RESOURCES.map((r) => (
                  <div key={r.id} className="resource-tile bg-[#ffffff] border-2 border-[#b3a369] p-3 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold" style={{ color: r.tagColor }}>{r.tag}</span>
                      <h3 className="text-xs font-black text-[#003057] mt-0.5">{r.title}</h3>
                      <p className="text-xs text-[#003057] mt-1 font-sans">{r.body}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#2d4f6c]">📍 {r.place}</span>
                      <button onClick={() => triggerNotification(r.note)} className="pixel-btn text-[10px] py-1 bg-[#003057] text-white">
                        {r.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= SECTION 3: COMMUNITY OPPORTUNITY BOARD ================= */}
            <div className="connect-section connect-board bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="section-banner board border-b-2 border-[#b3a369]">
                <span className="section-kicker text-[#b3a369]">SECTION 3 OF 3</span>
                <h2 className="text-[#003057]">📌 COMMUNITY OPPORTUNITY BOARD</h2>
                <p className="text-[#2d4f6c]">Postings from companies, labs, faculty, and students. Filter by major, location, pay, and type.</p>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#f8fafc] border-2 border-[#b3a369] p-3">
                  <div>
                    <label className="filter-label text-[#003057]">🎓 MAJOR</label>
                    <select value={boardMajor} onChange={(e) => setBoardMajor(e.target.value)} className="filter-select">
                      <option>All majors</option>
                      {MAJORS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="filter-label text-[#003057]">📍 LOCATION</label>
                    <select value={boardLocation} onChange={(e) => setBoardLocation(e.target.value)} className="filter-select">
                      <option>All locations</option>
                      {BOARD_LOCATIONS.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="filter-label text-[#003057]">💵 PAYMENT</label>
                    <select value={boardPay} onChange={(e) => setBoardPay(e.target.value)} className="filter-select">
                      <option>Any payment</option>
                      {BOARD_PAYS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="filter-label text-[#003057]">TYPE OF OPPORTUNITY</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    <button onClick={() => setBoardType("All types")} className={`tag-chip ${boardType === "All types" ? "selected" : ""}`}>
                      All types
                    </button>
                    {BOARD_TYPES.map((t) => (
                      <button key={t} onClick={() => setBoardType(t)} className={`tag-chip ${boardType === t ? "selected" : ""}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center flex-wrap gap-2 text-[11px] font-bold text-[#003057]">
                  <span>
                    Showing {boardFiltered.length} of {BOARD_POSTS.length} postings
                  </span>
                  {(boardMajor !== "All majors" || boardLocation !== "All locations" || boardPay !== "Any payment" || boardType !== "All types") && (
                    <button
                      onClick={() => {
                        setBoardMajor("All majors");
                        setBoardLocation("All locations");
                        setBoardPay("Any payment");
                        setBoardType("All types");
                      }}
                      className="underline text-[#b3a369]"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {boardFiltered.length === 0 ? (
                  <div className="text-xs text-[#2d4f6c] bg-[#ffffff] border-2 border-dashed border-[#b3a369] p-6 text-center">
                    No postings match these filters. Try loosening one of them.
                  </div>
                ) : (
                  <div className="board-grid">
                    {boardFiltered.map((post) => (
                      <div key={post.id} className="board-card bg-[#ffffff] border-2 border-[#b3a369]">
                        <div className="flex justify-between items-start gap-2">
                          <span className="board-type">{post.type.toUpperCase()}</span>
                          <span className={`pay-chip ${post.pay.toLowerCase()}`}>{post.pay}</span>
                        </div>
                        <h3 className="text-xs font-black text-[#003057] leading-snug m-0">{post.title}</h3>
                        <p className="text-[11px] font-bold text-[#b3a369] m-0">{post.org}</p>
                        <p className="text-[11px] text-[#003057] m-0 leading-snug font-sans">{post.blurb}</p>
                        <div className="flex flex-wrap gap-1">
                          {post.majors.map((m) => (
                            <span key={m} className="mini-tag">{m === "Any" ? "All majors" : m}</span>
                          ))}
                        </div>
                        <div className="text-[10px] text-[#2d4f6c] flex flex-col gap-0.5 mt-auto">
                          <span>📍 {post.location}</span>
                          <span>💵 {post.payNote}</span>
                          <span>🕒 Posted {post.posted} • Deadline: {post.deadline}</span>
                        </div>
                        <button
                          onClick={() => triggerNotification(`Saved interest in "${post.title}" at ${post.org}.`)}
                          className="pixel-btn text-[9px] py-1 px-2 self-start bg-[#003057] text-white"
                        >
                          I'm Interested →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            PAGE 6: INBOX
            ======================================================== */}
        {activeTab === "inbox" && (
          <section className="flex flex-col md:flex-row gap-4 h-[480px]">
            <div className="w-full md:w-72 pixel-box p-0 flex flex-col overflow-y-auto bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="p-2.5 bg-[#fcf9ee] border-b-2 border-[#b3a369] text-[10px] font-bold text-[#003057]">
                CAMPUS INBOX FOLDERS
              </div>
              <div className="flex flex-col">
                {inboxMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedInboxMessage(msg)}
                    className={`p-3 border-b border-[#e2e8f0] cursor-pointer hover:bg-[#fcf9ee] ${
                      selectedInboxMessage.id === msg.id ? "bg-[#fcf9ee] border-l-4 border-l-[#b3a369]" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <strong className="font-bold text-[#003057]">
                        {msg.sender}
                      </strong>
                      <span className="text-[#2d4f6c]">{msg.date}</span>
                    </div>
                    <p className="text-xs font-bold text-[#003057] truncate m-0">
                      {msg.subject}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 pixel-box p-4 flex flex-col justify-between overflow-y-auto bg-[#ffffff] border-2 border-[#b3a369]">
              <div>
                <div className="border-b-2 border-[#b3a369] pb-3 mb-3">
                  <h3 className="text-xs font-black text-[#003057] m-0">
                    {selectedInboxMessage.subject}
                  </h3>
                  <p className="text-xs text-[#2d4f6c] mt-1 m-0">
                    From: {selectedInboxMessage.sender} ({selectedInboxMessage.role}) • {selectedInboxMessage.date}
                  </p>
                </div>
                <div className="text-xs text-[#003057] whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedInboxMessage.body}
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setEmailTo(`${selectedInboxMessage.sender} (advisor@gatech.edu)`);
                    setEmailSubject(`Re: ${selectedInboxMessage.subject}`);
                    setEmailBody(`Dear ${selectedInboxMessage.sender},\n\nThank you for checking in. Here is an update on my coursework:\n\nBest,\n${userName}`);
                    setShowEmailModal(true);
                  }}
                  className="pixel-btn text-xs bg-[#003057] text-white"
                >
                  Reply to {selectedInboxMessage.sender} ➔
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            PAGE 7: MY NETWORK (WITH SEARCH BAR FOR PEOPLE)
            ======================================================== */}
        {activeTab === "network" && (
          <section className="flex flex-col gap-4">
            <div className="pixel-panel bg-[#ffffff] border-2 border-[#b3a369]">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-xs font-black text-[#003057] mb-1 m-0">
                    My Georgia Tech Network
                  </h2>
                  <p className="text-xs text-[#2d4f6c] m-0">
                    Your trusted connections, mentors, peer study partners, and faculty advisors across campus:
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-[#fcf9ee] text-[#003057] px-2 py-0.5 border border-[#b3a369]">
                  {filteredNetwork.length} CONTACTS
                </span>
              </div>

              {/* SEARCH BAR FOR PEOPLE IN MY NETWORK */}
              <div className="mt-3 pt-3 border-t border-[#e2e8f0]">
                <label className="text-[10px] font-bold text-[#003057] block mb-1">
                  🔍 SEARCH YOUR GT NETWORK (BY NAME, ROLE, OR DEPARTMENT):
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={networkSearch}
                    onChange={(e) => setNetworkSearch(e.target.value)}
                    placeholder="Search by name, role (e.g. Marcus, Vance, Tutor, ME, CS)..."
                    className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] focus:outline-none"
                  />
                  {networkSearch && (
                    <button
                      type="button"
                      onClick={() => setNetworkSearch("")}
                      className="pixel-btn secondary text-xs py-1.5 px-3 flex-shrink-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Network Contact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredNetwork.length === 0 ? (
                <div className="col-span-full p-6 text-center text-xs text-[#2d4f6c] bg-[#ffffff] border-2 border-dashed border-[#b3a369]">
                  No connections match "{networkSearch}". Try searching by department or clear search.
                </div>
              ) : (
                filteredNetwork.map((contact) => (
                  <div key={contact.id} className="pixel-box p-3 flex flex-col justify-between gap-2 bg-[#ffffff] border-2 border-[#b3a369] shadow-[2px_2px_0_#003057]">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-2xl">{contact.avatar}</span>
                        <div>
                          <strong className="text-xs font-bold text-[#003057] block">
                            {contact.name}
                          </strong>
                          <span className="text-[10px] text-[#2d4f6c] block">
                            {contact.role}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#003057] m-0 font-sans italic">
                        "{contact.note}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0] mt-1">
                      <span className="text-[9px] font-bold bg-[#fcf9ee] px-1.5 py-0.5 border border-[#d4c492] text-[#003057]">
                        {contact.type}
                      </span>
                      <button
                        onClick={() => {
                          setEmailTo(`${contact.name} (${contact.email})`);
                          setEmailSubject(`[GT Network] Connecting with ${contact.name}`);
                          setEmailBody(`Hello ${contact.name},\n\nI hope your semester is going well! Wanted to reach out and connect...\n\nBest,\n${userName}`);
                          setShowEmailModal(true);
                        }}
                        className="pixel-btn text-[9px] py-1 px-2.5 bg-[#003057] text-white"
                      >
                        Request Mentorship ✉
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {/* ========================================================
          PUBLISH MODAL (CLEAN WHITE BACKGROUND & NAVY TEXT)
          ======================================================== */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-[#003057]/60 z-50 flex items-center justify-center p-4">
          <div className="pixel-box w-full max-w-lg p-5 flex flex-col gap-3 bg-[#ffffff] border-3 border-[#b3a369] shadow-[6px_6px_0_#003057] text-[#003057]">
            <div className="flex justify-between items-center border-b-2 border-[#b3a369] pb-2">
              <h3 className="text-xs font-black text-[#003057] m-0">
                Share to Community / Start Collaborative Project
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-xs font-bold text-[#003057] hover:text-[#ba1c24]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#2d4f6c] m-0 font-sans">
              Posting helps fellow Georgia Tech students connect, collaborate, and navigate challenges together.
            </p>

            <div className="bg-[#fcf9ee] border-2 border-[#b3a369] p-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#003057]">
                <input
                  type="checkbox"
                  checked={isCollabPost}
                  onChange={(e) => setIsCollabPost(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>🤝 Make this a Collaborative Post (Allow peers to join & co-author)</span>
              </label>
              {isCollabPost && (
                <div className="mt-1">
                  <label className="text-[10px] font-bold text-[#003057] block">
                    COLLABORATION GOAL / LOOKING FOR:
                  </label>
                  <input
                    type="text"
                    value={collabGoal}
                    onChange={(e) => setCollabGoal(e.target.value)}
                    placeholder="e.g. Looking for 1 ECE student for PCB soldering & 1 CS student for ROS2 firmware"
                    className="w-full bg-[#ffffff] border border-[#b3a369] p-1.5 text-xs text-[#003057] mt-0.5"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="bg-[#ffffff] border border-[#b3a369] p-2 text-xs flex items-center gap-2 cursor-pointer text-[#003057]">
                <input
                  type="radio"
                  name="pub-identity"
                  checked={!publishAnonymous}
                  onChange={() => setPublishAnonymous(false)}
                />
                <span>Post with your Student Name ({userName})</span>
              </label>
              <label className="bg-[#ffffff] border border-[#b3a369] p-2 text-xs flex items-center gap-2 cursor-pointer text-[#003057]">
                <input
                  type="radio"
                  name="pub-identity"
                  checked={publishAnonymous}
                  onChange={() => setPublishAnonymous(true)}
                />
                <span>Post Anonymously as "Anonymous Buzz"</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="pixel-btn secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="pixel-btn text-xs bg-[#003057] text-white"
              >
                Confirm & Publish →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          JOIN COLLABORATION MODAL (CLEAN WHITE BACKGROUND)
          ======================================================== */}
      {showJoinCollabModal && activeCollabPost && (
        <div className="fixed inset-0 bg-[#003057]/60 z-50 flex items-center justify-center p-4">
          <div className="pixel-box w-full max-w-md p-5 flex flex-col gap-3 bg-[#ffffff] border-3 border-[#b3a369] shadow-[6px_6px_0_#003057] text-[#003057]">
            <div className="flex justify-between items-center border-b-2 border-[#b3a369] pb-2">
              <h3 className="text-xs font-black text-[#003057] m-0">
                🤝 Join Collaborative Post
              </h3>
              <button
                onClick={() => setShowJoinCollabModal(false)}
                className="text-xs font-bold text-[#003057] hover:text-[#ba1c24]"
              >
                ✕
              </button>
            </div>
            <p className="text-xs font-bold text-[#b3a369] m-0">
              {activeCollabPost.title}
            </p>
            <div>
              <label className="text-[10px] font-bold text-[#003057]">
                YOUR NAME & MAJOR:
              </label>
              <input
                type="text"
                value={joinCollabName}
                onChange={(e) => setJoinCollabName(e.target.value)}
                className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-1.5 text-xs text-[#003057] mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#003057]">
                YOUR CONTRIBUTION / HOW YOU CAN HELP:
              </label>
              <textarea
                rows={3}
                value={joinCollabNote}
                onChange={(e) => setJoinCollabNote(e.target.value)}
                placeholder="e.g. I have experience with SolidWorks and can design the motor housing!"
                className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-1.5 text-xs text-[#003057] mt-0.5 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowJoinCollabModal(false)}
                className="pixel-btn secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinCollab}
                className="pixel-btn text-xs bg-[#003057] text-white"
              >
                Submit Contribution ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          REQUEST MENTORSHIP / EMAIL MODAL
          (CLEAN PURE WHITE BACKGROUND FOR MAXIMUM READABILITY)
          ======================================================== */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-[#003057]/60 z-50 flex items-center justify-center p-4">
          <div className="pixel-box w-full max-w-lg p-5 flex flex-col gap-3 bg-[#ffffff] border-3 border-[#b3a369] shadow-[8px_8px_0_#003057] text-[#003057]">
            <div className="flex justify-between items-center border-b-2 border-[#b3a369] pb-2">
              <h3 className="text-xs font-black text-[#003057] m-0">
                ✉️ Request Mentorship / Send Campus Communication
              </h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-xs font-bold text-[#003057] hover:text-[#ba1c24]"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#003057]">To:</label>
              <input
                type="text"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-1.5 text-xs text-[#003057] mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#003057]">Subject:</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-1.5 text-xs text-[#003057] mt-0.5"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#003057]">Message Body:</label>
              <textarea
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-[#ffffff] border-2 border-[#b3a369] p-2 text-xs text-[#003057] mt-0.5 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="pixel-btn secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  triggerNotification("✉ Update sent! A copy has been saved to your campus records.");
                }}
                className="pixel-btn text-xs bg-[#003057] text-white"
              >
                Send Through App →
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
          CUSTOM WALKING ART & SPRITE LOADER MODAL
          (PURE WHITE BG, LIVE PREVIEW, FILE UPLOAD & URL SUPPORT)
          ======================================================== */}
      {showArtModal && (
        <div className="fixed inset-0 bg-[#003057]/60 z-50 flex items-center justify-center p-4">
          <div className="pixel-box w-full max-w-xl p-5 flex flex-col gap-4 bg-[#ffffff] border-3 border-[#b3a369] shadow-[8px_8px_0_#003057] text-[#003057] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-[#b3a369] pb-2">
              <h3 className="text-xs font-black text-[#003057] m-0 font-['Press_Start_2P']">
                🎨 Walking Animation & Sprite Loader
              </h3>
              <button
                type="button"
                onClick={() => setShowArtModal(false)}
                className="text-xs font-bold text-[#003057] hover:text-[#ba1c24]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#2d4f6c] m-0">
              Customize what character walks along the campus sidewalk in your Journal tab! Choose between the classic Buzz Bee, custom animated image, or a 2-frame walking cycle.
            </p>

            {/* LIVE WALKING PREVIEW BOX */}
            <div className="border-2 border-[#b3a369] bg-[#8ac0e2] p-3 flex flex-col items-center justify-center relative h-28 overflow-hidden shadow-inner">
              <div className="absolute top-2 left-2 text-[9px] font-bold bg-[#ffffff]/90 px-1.5 py-0.5 border border-[#b3a369] text-[#003057]">
                LIVE WALK PREVIEW
              </div>
              <div className="absolute bottom-0 left-0 w-full h-8 bg-[#4b5563] border-t-2 border-[#6b7280]" />
              <div className="relative z-10 w-12 h-12 flex items-center justify-center animate-bounce">
                {walkingArtMode === "two_frame" && (frame1Url || frame2Url) ? (
                  <img
                    src={currentWalkFrame === 1 ? (frame1Url || frame2Url) : (frame2Url || frame1Url)}
                    alt="Preview"
                    className="w-12 h-12 object-contain"
                  />
                ) : (walkingArtMode === "custom_url" || walkingArtMode === "custom_upload") && customSpriteUrl ? (
                  <img
                    src={customSpriteUrl}
                    alt="Preview"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-3xl">🐝</span>
                )}
              </div>
            </div>

            {/* MODE SELECTION TABS */}
            <div className="flex gap-2 border-b border-[#d4c492] pb-2">
              <button
                type="button"
                onClick={() => setWalkingArtMode("bee")}
                className={`text-[10px] font-bold px-2.5 py-1 border ${
                  walkingArtMode === "bee"
                    ? "bg-[#003057] text-white border-[#003057]"
                    : "bg-[#fcf9ee] text-[#003057] border-[#b3a369]"
                }`}
              >
                1. Classic Buzz Bee
              </button>
              <button
                type="button"
                onClick={() => setWalkingArtMode("custom_url")}
                className={`text-[10px] font-bold px-2.5 py-1 border ${
                  walkingArtMode === "custom_url" || walkingArtMode === "custom_upload"
                    ? "bg-[#003057] text-white border-[#003057]"
                    : "bg-[#fcf9ee] text-[#003057] border-[#b3a369]"
                }`}
              >
                2. Single Sprite / GIF
              </button>
              <button
                type="button"
                onClick={() => setWalkingArtMode("two_frame")}
                className={`text-[10px] font-bold px-2.5 py-1 border ${
                  walkingArtMode === "two_frame"
                    ? "bg-[#003057] text-white border-[#003057]"
                    : "bg-[#fcf9ee] text-[#003057] border-[#b3a369]"
                }`}
              >
                3. 2-Frame Walk Cycle
              </button>
            </div>

            {/* MODE CONTENT */}
            {walkingArtMode === "bee" && (
              <div className="p-3 bg-[#fcf9ee] border border-[#b3a369] text-xs">
                <p className="font-bold text-[#003057] mb-1">
                  Default Vector Pixel Yellow Jacket (Buzz):
                </p>
                <p className="text-[11px] text-[#594326] m-0">
                  Features built-in alternating leg animations, buzzing fluttering wings, and a dynamic sidewalk shadow.
                </p>
              </div>
            )}

            {(walkingArtMode === "custom_url" || walkingArtMode === "custom_upload") && (
              <div className="flex flex-col gap-2 p-3 bg-[#fcf9ee] border border-[#b3a369] text-xs">
                <span className="font-bold text-[#003057]">
                  Upload from Device or Paste Image URL (GIF, PNG, WebP):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCustomFileUpload(e, "single")}
                    className="text-xs text-[#003057]"
                  />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] text-[#594326] font-bold">Or enter Image URL:</span>
                  <input
                    type="text"
                    placeholder="https://... or data:image/..."
                    value={customSpriteUrl}
                    onChange={(e) => {
                      setCustomSpriteUrl(e.target.value);
                      setWalkingArtMode("custom_url");
                    }}
                    className="bg-[#ffffff] border border-[#b3a369] p-1.5 text-xs text-[#003057] w-full"
                  />
                </div>
              </div>
            )}

            {walkingArtMode === "two_frame" && (
              <div className="flex flex-col gap-3 p-3 bg-[#fcf9ee] border border-[#b3a369] text-xs">
                <span className="font-bold text-[#003057]">
                  2-Frame Step Cycle (Automatically toggles every step as you type):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 bg-[#ffffff] border border-[#b3a369]">
                    <span className="text-[10px] font-bold text-[#003057] block mb-1">
                      Frame 1 (Left Step):
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCustomFileUpload(e, "frame1")}
                      className="text-[10px] text-[#003057] mb-1"
                    />
                    <input
                      type="text"
                      placeholder="Frame 1 URL..."
                      value={frame1Url}
                      onChange={(e) => setFrame1Url(e.target.value)}
                      className="bg-[#ffffff] border border-[#b3a369] p-1 text-[10px] text-[#003057] w-full"
                    />
                  </div>
                  <div className="p-2 bg-[#ffffff] border border-[#b3a369]">
                    <span className="text-[10px] font-bold text-[#003057] block mb-1">
                      Frame 2 (Right Step):
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCustomFileUpload(e, "frame2")}
                      className="text-[10px] text-[#003057] mb-1"
                    />
                    <input
                      type="text"
                      placeholder="Frame 2 URL..."
                      value={frame2Url}
                      onChange={(e) => setFrame2Url(e.target.value)}
                      className="bg-[#ffffff] border border-[#b3a369] p-1 text-[10px] text-[#003057] w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center pt-2 border-t border-[#d4c492] flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalkingArtMode("bee");
                  setCustomSpriteUrl("");
                  setFrame1Url("");
                  setFrame2Url("");
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("gt_walking_art_mode");
                    localStorage.removeItem("gt_custom_sprite_url");
                    localStorage.removeItem("gt_frame1_url");
                    localStorage.removeItem("gt_frame2_url");
                  }
                  triggerNotification("Reset to classic Buzz Bee.");
                }}
                className="pixel-btn secondary text-xs"
              >
                Reset to Buzz Bee
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowArtModal(false)}
                  className="pixel-btn secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("gt_walking_art_mode", walkingArtMode);
                      if (customSpriteUrl) localStorage.setItem("gt_custom_sprite_url", customSpriteUrl);
                      if (frame1Url) localStorage.setItem("gt_frame1_url", frame1Url);
                      if (frame2Url) localStorage.setItem("gt_frame2_url", frame2Url);
                    }
                    setShowArtModal(false);
                    triggerNotification("🎉 Walking animation updated!");
                  }}
                  className="pixel-btn text-xs bg-[#003057] text-white"
                >
                  Apply & Keep Walking →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
