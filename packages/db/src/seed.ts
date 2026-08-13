/**
 * seed.ts — Coherent dummy data for the hire-me platform.
 *
 * Story:
 *   - 3 clubs: ACM Student Chapter, Design Collective, Robotics Club
 *   - 5 students (some verified DK24 members, some pending, one rejected)
 *   - 2 recruiters: a startup (ByteForge) and a mid-size company (NexaHire)
 *   - 4 job postings across different employment types
 *   - Applications from students to postings
 *   - Skills, projects, experience, achievements per student
 *   - Club memberships + verification requests (auto-matched & manual)
 *   - Notifications for key events
 *
 * Run: pnpm --filter @repo/db db:seed
 * Requires: DATABASE_URL in .env at packages/db/.env  (or root .env)
 */

import 'dotenv/config'
import * as schema from './schema/index'
import { getDb } from './db-client'

// ─────────────────────────────────────────────────────────
// Hard-coded UUIDs so foreign-key relationships are obvious
// ─────────────────────────────────────────────────────────

// Users
const U_ARJUN = '00000000-0001-0000-0000-000000000001' // student
const U_PRIYA = '00000000-0001-0000-0000-000000000002' // student
const U_KIRAN = '00000000-0001-0000-0000-000000000003' // student
const U_SNEHA = '00000000-0001-0000-0000-000000000004' // student
const U_ROHAN = '00000000-0001-0000-0000-000000000005' // student
const U_RECRUITER_BYTE = '00000000-0002-0000-0000-000000000001' // recruiter
const U_RECRUITER_NEXA = '00000000-0002-0000-0000-000000000002' // recruiter
const U_ADMIN_ACM = '00000000-0003-0000-0000-000000000001' // club_admin
const U_ADMIN_DESIGN = '00000000-0003-0000-0000-000000000002' // club_admin
const U_CORE = '00000000-0004-0000-0000-000000000001' // core_admin

// Clubs
const C_ACM = '00000000-0010-0000-0000-000000000001'
const C_DESIGN = '00000000-0010-0000-0000-000000000002'
const C_ROBOT = '00000000-0010-0000-0000-000000000003'

// Postings
const P_FULLSTACK = '00000000-0020-0000-0000-000000000001'
const P_DESIGN_IN = '00000000-0020-0000-0000-000000000002'
const P_BACKEND = '00000000-0020-0000-0000-000000000003'
const P_CONTRACT = '00000000-0020-0000-0000-000000000004'

// Club memberships
const CM_ARJUN_ACM = '00000000-0030-0000-0000-000000000001'
const CM_PRIYA_DESIGN = '00000000-0030-0000-0000-000000000002'
const CM_KIRAN_ACM = '00000000-0030-0000-0000-000000000003'
const CM_SNEHA_ROBOT = '00000000-0030-0000-0000-000000000004'

// ─────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────
async function seed() {
  const db = await getDb()
  console.log('🌱  Seeding database...\n')

  // ── 1. Users ─────────────────────────────────────────
  console.log('  → users')
  await db
    .insert(schema.users)
    .values([
      // Students
      {
        id: U_ARJUN,
        email: 'arjun.sharma@college.edu',
        fullName: 'Arjun Sharma',
        roles: ['student'],
      },
      { id: U_PRIYA, email: 'priya.nair@college.edu', fullName: 'Priya Nair', roles: ['student'] },
      { id: U_KIRAN, email: 'kiran.rao@college.edu', fullName: 'Kiran Rao', roles: ['student'] },
      {
        id: U_SNEHA,
        email: 'sneha.menon@college.edu',
        fullName: 'Sneha Menon',
        roles: ['student'],
      },
      {
        id: U_ROHAN,
        email: 'rohan.gupta@college.edu',
        fullName: 'Rohan Gupta',
        roles: ['student'],
      },
      // Recruiters
      {
        id: U_RECRUITER_BYTE,
        email: 'hr@byteforge.io',
        fullName: 'ByteForge HR',
        roles: ['recruiter'],
      },
      {
        id: U_RECRUITER_NEXA,
        email: 'talent@nexahire.com',
        fullName: 'NexaHire Talent',
        roles: ['recruiter'],
      },
      // Club admins (also students in real life)
      {
        id: U_ADMIN_ACM,
        email: 'acm-lead@college.edu',
        fullName: 'Dev Kumar',
        roles: ['student', 'club_admin'],
      },
      {
        id: U_ADMIN_DESIGN,
        email: 'design-lead@college.edu',
        fullName: 'Ananya Iyer',
        roles: ['student', 'club_admin'],
      },
      // Core admin
      {
        id: U_CORE,
        email: 'admin@hire-me.college',
        fullName: 'Platform Admin',
        roles: ['core_admin'],
      },
    ])
    .onConflictDoNothing()

  // ── 2. Clubs ─────────────────────────────────────────
  console.log('  → clubs')
  await db
    .insert(schema.clubs)
    .values([
      { id: C_ACM, name: 'ACM Student Chapter', slug: 'acm', isActive: true },
      { id: C_DESIGN, name: 'Design Collective', slug: 'design', isActive: true },
      { id: C_ROBOT, name: 'Robotics Club', slug: 'robotics', isActive: true },
    ])
    .onConflictDoNothing()

  // ── 3. Club Admins ───────────────────────────────────
  console.log('  → club_admins')
  await db
    .insert(schema.clubAdmins)
    .values([
      { userId: U_ADMIN_ACM, clubId: C_ACM },
      { userId: U_ADMIN_DESIGN, clubId: C_DESIGN },
    ])
    .onConflictDoNothing()

  // ── 4. Recruiters ────────────────────────────────────
  console.log('  → recruiters')
  await db
    .insert(schema.recruiters)
    .values([
      {
        userId: U_RECRUITER_BYTE,
        companyName: 'ByteForge',
        companyMail: 'hr@byteforge.io',
        companyUrl: 'https://byteforge.io',
        headquartersLocation: 'Bangalore, Karnataka',
      },
      {
        userId: U_RECRUITER_NEXA,
        companyName: 'NexaHire Technologies',
        companyMail: 'talent@nexahire.com',
        companyUrl: 'https://nexahire.com',
        headquartersLocation: 'Mumbai, Maharashtra',
      },
    ])
    .onConflictDoNothing()

  // ── 5. Student Profiles ──────────────────────────────
  console.log('  → student_profiles')
  await db
    .insert(schema.studentProfiles)
    .values([
      {
        userId: U_ARJUN,
        headline: 'Full-Stack Developer | React & Node.js',
        bio: 'Final year CS student passionate about building scalable web apps. ACM chapter lead and open-source contributor.',
        gradYear: 2025,
        openToWork: true,
        resumeUrl: 'https://cdn.hire-me.college/resumes/arjun-sharma.pdf',
        githubUrl: 'https://github.com/arjunsharma',
        linkedinUrl: 'https://linkedin.com/in/arjunsharma',
        dk24Status: 'verified',
        consentGivenAt: new Date('2024-09-01'),
      },
      {
        userId: U_PRIYA,
        headline: 'UI/UX Designer | Figma & Design Systems',
        bio: 'Design Collective member. Love crafting interfaces that feel intuitive and delightful.',
        gradYear: 2025,
        openToWork: true,
        resumeUrl: 'https://cdn.hire-me.college/resumes/priya-nair.pdf',
        linkedinUrl: 'https://linkedin.com/in/priyanair',
        otherLinks: {
          portfolio: 'https://priyanair.design',
          behance: 'https://behance.net/priyanair',
        },
        dk24Status: 'verified',
        consentGivenAt: new Date('2024-09-15'),
      },
      {
        userId: U_KIRAN,
        headline: 'Backend Engineer | Go & Distributed Systems',
        bio: 'Third-year CSE. Interested in databases, distributed systems, and competitive programming.',
        gradYear: 2026,
        openToWork: false,
        githubUrl: 'https://github.com/kiranrao',
        dk24Status: 'pending',
      },
      {
        userId: U_SNEHA,
        headline: 'Embedded Systems & Robotics',
        bio: 'Robotics club core team. Loves tinkering with hardware and control systems.',
        gradYear: 2026,
        openToWork: true,
        resumeUrl: 'https://cdn.hire-me.college/resumes/sneha-menon.pdf',
        dk24Status: 'verified',
        consentGivenAt: new Date('2024-10-01'),
      },
      {
        userId: U_ROHAN,
        headline: 'ML Enthusiast | Python & PyTorch',
        bio: 'Working on NLP research. Failed DK24 verification due to USN mismatch.',
        gradYear: 2025,
        openToWork: true,
        githubUrl: 'https://github.com/rohangupta-ml',
        dk24Status: 'rejected',
      },
    ])
    .onConflictDoNothing()

  // ── 6. Contact Details ───────────────────────────────
  console.log('  → contact_details')
  await db
    .insert(schema.contactDetails)
    .values([
      { studentId: U_ARJUN, phone: '+91-9876543210' },
      { studentId: U_PRIYA, phone: '+91-9123456789' },
      { studentId: U_SNEHA, phone: '+91-9988776655' },
    ])
    .onConflictDoNothing()

  // ── 7. Skills ────────────────────────────────────────
  console.log('  → skills')
  await db
    .insert(schema.skills)
    .values([
      // Arjun
      { studentId: U_ARJUN, skill: 'TypeScript' },
      { studentId: U_ARJUN, skill: 'React' },
      { studentId: U_ARJUN, skill: 'Node.js' },
      { studentId: U_ARJUN, skill: 'PostgreSQL' },
      { studentId: U_ARJUN, skill: 'Docker' },
      // Priya
      { studentId: U_PRIYA, skill: 'Figma' },
      { studentId: U_PRIYA, skill: 'Design Systems' },
      { studentId: U_PRIYA, skill: 'User Research' },
      { studentId: U_PRIYA, skill: 'Prototyping' },
      // Kiran
      { studentId: U_KIRAN, skill: 'Go' },
      { studentId: U_KIRAN, skill: 'Redis' },
      { studentId: U_KIRAN, skill: 'gRPC' },
      { studentId: U_KIRAN, skill: 'Kubernetes' },
      // Sneha
      { studentId: U_SNEHA, skill: 'C/C++' },
      { studentId: U_SNEHA, skill: 'ROS' },
      { studentId: U_SNEHA, skill: 'Arduino' },
      { studentId: U_SNEHA, skill: 'MATLAB' },
      // Rohan
      { studentId: U_ROHAN, skill: 'Python' },
      { studentId: U_ROHAN, skill: 'PyTorch' },
      { studentId: U_ROHAN, skill: 'NLP' },
      { studentId: U_ROHAN, skill: 'HuggingFace' },
    ])
    .onConflictDoNothing()

  // ── 8. Projects ──────────────────────────────────────
  console.log('  → projects')
  await db
    .insert(schema.projects)
    .values([
      {
        studentId: U_ARJUN,
        title: 'hire-me Platform',
        description:
          'Campus job-board with DK24 student verification, club management, and recruiter portal.',
        role: 'Full-Stack Lead',
        contributions:
          'Designed the database schema, built REST API with Hono, and implemented the React frontend.',
        learnings: 'Drizzle ORM, Cloudflare Workers, Neon serverless Postgres.',
        skillsUsed: ['TypeScript', 'React', 'Hono', 'Drizzle ORM', 'PostgreSQL'],
        githubUrl: 'https://github.com/arjunsharma/hire-me',
        displayOrder: 0,
      },
      {
        studentId: U_ARJUN,
        title: 'DevTrack — Sprint Board',
        description:
          'Lightweight kanban board for small engineering teams with real-time updates via WebSockets.',
        role: 'Backend Developer',
        skillsUsed: ['Node.js', 'WebSockets', 'PostgreSQL'],
        liveUrl: 'https://devtrack.arjunsharma.dev',
        displayOrder: 1,
      },
      {
        studentId: U_PRIYA,
        title: 'MindSpace — Mental Wellness App',
        description:
          'Full UX redesign of a mental wellness mobile app. Led usability testing with 30 participants.',
        role: 'Lead Designer',
        contributions:
          'End-to-end design: user research, wireframes, high-fidelity prototypes, and handoff specs.',
        skillsUsed: ['Figma', 'User Research', 'Prototyping'],
        liveUrl: 'https://priyanair.design/mindspace',
        displayOrder: 0,
      },
      {
        studentId: U_SNEHA,
        title: 'Autonomous Line-Following Robot',
        description:
          'Built a PID-controlled line-following robot for the inter-college robotics fest.',
        role: 'Hardware & Firmware Lead',
        contributions:
          'PCB design, motor control firmware in C++, and computer vision integration with OpenCV.',
        skillsUsed: ['C/C++', 'Arduino', 'OpenCV', 'PID Control'],
        displayOrder: 0,
      },
      {
        studentId: U_ROHAN,
        title: 'SentimentLens',
        description:
          'Fine-tuned BERT model for aspect-based sentiment analysis on product reviews.',
        role: 'ML Engineer',
        contributions:
          'Data pipeline, model fine-tuning, evaluation on SemEval dataset, and a Gradio demo.',
        skillsUsed: ['Python', 'PyTorch', 'HuggingFace', 'Gradio'],
        githubUrl: 'https://github.com/rohangupta-ml/sentimentlens',
        displayOrder: 0,
      },
    ])
    .onConflictDoNothing()

  // ── 9. Experience ────────────────────────────────────
  console.log('  → experience')
  await db
    .insert(schema.experience)
    .values([
      {
        studentId: U_ARJUN,
        companyName: 'CodeSphere Labs',
        role: 'Software Intern',
        startDate: '2024-05-01',
        endDate: '2024-07-31',
        contributions:
          'Built a PDF parsing microservice using Node.js and pdfjs. Reduced processing time by 40%.',
      },
      {
        studentId: U_PRIYA,
        companyName: 'Kreative Agency',
        role: 'Design Intern',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        contributions:
          'Revamped the brand identity for 3 client projects. Delivered Figma-to-HTML asset exports.',
      },
      {
        studentId: U_KIRAN,
        companyName: 'DataFlow Systems',
        role: 'Backend Engineering Intern',
        startDate: '2025-01-06',
        endDate: null,
        contributions:
          'Building a high-throughput event pipeline in Go using Kafka and Redis Streams.',
      },
      {
        studentId: U_SNEHA,
        companyName: 'TechRobotics Pvt Ltd',
        role: 'Robotics Intern',
        startDate: '2024-12-01',
        endDate: '2025-02-28',
        contributions: 'Developed ROS2 navigation stack for a warehouse AMR prototype.',
      },
    ])
    .onConflictDoNothing()

  // ── 10. Achievements ─────────────────────────────────
  console.log('  → achievements')
  await db
    .insert(schema.achievements)
    .values([
      {
        studentId: U_ARJUN,
        type: 'hackathon',
        title: '1st Place — HackVITesse 2024',
        description: 'Won the 36-hour national hackathon with hire-me platform prototype.',
        date: '2024-03-15',
      },
      {
        studentId: U_ARJUN,
        type: 'certification',
        title: 'AWS Certified Developer – Associate',
        date: '2024-08-10',
      },
      {
        studentId: U_PRIYA,
        type: 'award',
        title: 'Best UX Design — Campus Innovation Fair 2024',
        description: 'Awarded for the MindSpace redesign project.',
        date: '2024-11-20',
      },
      {
        studentId: U_SNEHA,
        type: 'hackathon',
        title: '2nd Place — Robocon India 2024',
        description: 'Competed in the national Robocon competition with the college robotics team.',
        date: '2024-02-28',
      },
      {
        studentId: U_ROHAN,
        type: 'other',
        title: 'Research Paper — EMNLP 2025 Workshop',
        description:
          'Co-authored a paper on aspect-level sentiment analysis accepted at EMNLP 2025 student workshop.',
        date: '2025-07-01',
      },
    ])
    .onConflictDoNothing()

  // ── 11. Postings ─────────────────────────────────────
  console.log('  → postings')
  await db
    .insert(schema.postings)
    .values([
      {
        id: P_FULLSTACK,
        recruiterId: U_RECRUITER_BYTE,
        title: 'Full-Stack Engineer Intern',
        description:
          'Join ByteForge to build our core developer tooling platform. You will own features end-to-end, from API design to frontend delivery. We use TypeScript, React, and Node.js on a Cloudflare Workers edge stack.',
        stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Cloudflare Workers'],
        employmentType: 'internship',
        workArrangement: 'hybrid',
        seniorityLevel: 'junior',
        compensation: '₹25,000 / month',
        location: 'Bangalore, KA',
        deadline: '2025-10-15',
        status: 'active',
      },
      {
        id: P_DESIGN_IN,
        recruiterId: U_RECRUITER_BYTE,
        title: 'Product Design Intern',
        description:
          "We are looking for a design intern who can own user research, wireframes, and high-fidelity prototypes for ByteForge's flagship product. Strong Figma skills required.",
        stack: ['Figma', 'User Research', 'Prototyping'],
        employmentType: 'internship',
        workArrangement: 'remote',
        seniorityLevel: 'junior',
        compensation: '₹20,000 / month',
        deadline: '2025-10-01',
        status: 'active',
      },
      {
        id: P_BACKEND,
        recruiterId: U_RECRUITER_NEXA,
        title: 'Backend Engineer (Full-Time)',
        description:
          'NexaHire is scaling its matching engine. We need a backend engineer with strong experience in distributed systems, Go or Rust, and event-driven architectures.',
        stack: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes'],
        employmentType: 'full_time',
        workArrangement: 'in_person',
        seniorityLevel: 'mid',
        compensation: '₹18 LPA – ₹24 LPA',
        location: 'Mumbai, MH',
        deadline: '2025-11-30',
        status: 'active',
      },
      {
        id: P_CONTRACT,
        recruiterId: U_RECRUITER_NEXA,
        title: 'ML Engineer (Contract)',
        description:
          'Short-term contract to fine-tune and evaluate transformer models for resume-to-job-description matching. Must be comfortable with HuggingFace and model evaluation metrics.',
        stack: ['Python', 'PyTorch', 'HuggingFace', 'FAISS'],
        employmentType: 'contract',
        workArrangement: 'remote',
        seniorityLevel: 'junior',
        compensation: '₹1,200 / day',
        deadline: '2025-09-20',
        status: 'active',
      },
    ])
    .onConflictDoNothing()

  // ── 12. Applications ─────────────────────────────────
  console.log('  → applications')
  await db
    .insert(schema.applications)
    .values([
      // Arjun → Full-Stack Intern (shortlisted)
      {
        postingId: P_FULLSTACK,
        studentId: U_ARJUN,
        status: 'shortlisted',
        appliedAt: new Date('2025-08-05T10:30:00Z'),
        updatedAt: new Date('2025-08-08T09:00:00Z'),
      },
      // Priya → Design Intern (under review)
      {
        postingId: P_DESIGN_IN,
        studentId: U_PRIYA,
        status: 'under_review',
        appliedAt: new Date('2025-08-06T14:00:00Z'),
      },
      // Arjun → Backend (just applied, stretch role)
      {
        postingId: P_BACKEND,
        studentId: U_ARJUN,
        status: 'applied',
        appliedAt: new Date('2025-08-09T18:00:00Z'),
      },
      // Kiran → Backend (under review)
      {
        postingId: P_BACKEND,
        studentId: U_KIRAN,
        status: 'under_review',
        appliedAt: new Date('2025-08-07T11:00:00Z'),
      },
      // Rohan → ML Contract (applied)
      {
        postingId: P_CONTRACT,
        studentId: U_ROHAN,
        status: 'applied',
        appliedAt: new Date('2025-08-08T08:00:00Z'),
      },
      // Sneha → Full-Stack (rejected — not matching)
      {
        postingId: P_FULLSTACK,
        studentId: U_SNEHA,
        status: 'rejected',
        appliedAt: new Date('2025-08-04T09:00:00Z'),
        updatedAt: new Date('2025-08-07T15:00:00Z'),
      },
    ])
    .onConflictDoNothing()

  // ── 13. Club Memberships ─────────────────────────────
  console.log('  → club_memberships')
  await db
    .insert(schema.clubMemberships)
    .values([
      // ACM chapter
      {
        id: CM_ARJUN_ACM,
        clubId: C_ACM,
        userId: U_ARJUN,
        role: 'member',
        fullName: 'Arjun Sharma',
        usn: '1CS21CS010',
        email: 'arjun.sharma@college.edu',
      },
      {
        id: CM_KIRAN_ACM,
        clubId: C_ACM,
        userId: U_KIRAN,
        role: 'member',
        fullName: 'Kiran Rao',
        usn: '1CS22CS045',
        email: 'kiran.rao@college.edu',
      },
      // Admin of ACM — also a member
      {
        clubId: C_ACM,
        userId: U_ADMIN_ACM,
        role: 'admin',
        fullName: 'Dev Kumar',
        usn: '1CS21CS001',
        email: 'acm-lead@college.edu',
      },
      // Design Collective
      {
        id: CM_PRIYA_DESIGN,
        clubId: C_DESIGN,
        userId: U_PRIYA,
        role: 'member',
        fullName: 'Priya Nair',
        usn: '1CS21CS022',
        email: 'priya.nair@college.edu',
      },
      {
        clubId: C_DESIGN,
        userId: U_ADMIN_DESIGN,
        role: 'admin',
        fullName: 'Ananya Iyer',
        usn: '1CS21CS003',
        email: 'design-lead@college.edu',
      },
      // Robotics Club
      {
        id: CM_SNEHA_ROBOT,
        clubId: C_ROBOT,
        userId: U_SNEHA,
        role: 'member',
        fullName: 'Sneha Menon',
        usn: '1EE22EE015',
        email: 'sneha.menon@college.edu',
      },
      // Rohan's record has a USN mismatch — no userId linked yet
      {
        clubId: C_ACM,
        userId: null,
        role: 'member',
        fullName: 'Rohan Gupta',
        usn: '1CS21CS099', // ← wrong USN — causes verification failure
        email: 'rohan.gupta@college.edu',
      },
    ])
    .onConflictDoNothing()

  // ── 14. Verification Requests ────────────────────────
  console.log('  → verification_requests')
  await db
    .insert(schema.verificationRequests)
    .values([
      // Arjun: auto-matched → verified
      {
        studentId: U_ARJUN,
        usn: '1CS21CS010',
        clubId: C_ACM,
        matchedClubMembershipId: CM_ARJUN_ACM,
        autoMatched: true,
        submittedAt: new Date('2024-08-28T10:00:00Z'),
        appliedAt: new Date('2024-08-28T10:00:00Z'),
        resubmitCount: 0,
      },
      // Priya: auto-matched → verified
      {
        studentId: U_PRIYA,
        usn: '1CS21CS022',
        clubId: C_DESIGN,
        matchedClubMembershipId: CM_PRIYA_DESIGN,
        autoMatched: true,
        submittedAt: new Date('2024-09-10T11:00:00Z'),
        appliedAt: new Date('2024-09-10T11:00:00Z'),
        resubmitCount: 0,
      },
      // Kiran: pending manual review (no auto-match found)
      {
        studentId: U_KIRAN,
        usn: '1CS22CS045',
        clubId: C_ACM,
        matchedClubMembershipId: null,
        autoMatched: false,
        submittedAt: new Date('2025-07-15T09:00:00Z'),
        resubmitCount: 0,
      },
      // Sneha: auto-matched → verified
      {
        studentId: U_SNEHA,
        usn: '1EE22EE015',
        clubId: C_ROBOT,
        matchedClubMembershipId: CM_SNEHA_ROBOT,
        autoMatched: true,
        submittedAt: new Date('2024-09-20T14:00:00Z'),
        appliedAt: new Date('2024-09-20T14:00:00Z'),
        resubmitCount: 0,
      },
      // Rohan: USN mismatch → rejected — resubmitted once, still failing
      {
        studentId: U_ROHAN,
        usn: '1CS21CS088', // submitted USN — doesn't match club record (099)
        clubId: C_ACM,
        matchedClubMembershipId: null,
        autoMatched: false,
        submittedAt: new Date('2025-06-01T08:00:00Z'),
        resubmitCount: 1,
      },
    ])
    .onConflictDoNothing()

  // ── 15. Notifications ────────────────────────────────
  console.log('  → notifications')
  await db
    .insert(schema.notifications)
    .values([
      // Arjun shortlisted
      {
        userId: U_ARJUN,
        type: 'status_changed',
        payload: {
          postingId: P_FULLSTACK,
          postingTitle: 'Full-Stack Engineer Intern',
          company: 'ByteForge',
          newStatus: 'shortlisted',
        },
        readAt: new Date('2025-08-08T10:00:00Z'),
        createdAt: new Date('2025-08-08T09:00:00Z'),
      },
      // Arjun: new matching posting (Backend at NexaHire)
      {
        userId: U_ARJUN,
        type: 'new_matching_posting',
        payload: {
          postingId: P_BACKEND,
          postingTitle: 'Backend Engineer (Full-Time)',
          company: 'NexaHire',
          matchReason: 'PostgreSQL & Docker in your skill set',
        },
        createdAt: new Date('2025-08-07T08:00:00Z'),
      },
      // Priya: application received confirmation
      {
        userId: U_PRIYA,
        type: 'application_received',
        payload: {
          postingId: P_DESIGN_IN,
          postingTitle: 'Product Design Intern',
          company: 'ByteForge',
        },
        createdAt: new Date('2025-08-06T14:05:00Z'),
      },
      // ByteForge recruiter: application received from Arjun
      {
        userId: U_RECRUITER_BYTE,
        type: 'application_received',
        payload: {
          postingId: P_FULLSTACK,
          applicantName: 'Arjun Sharma',
          applicantId: U_ARJUN,
        },
        createdAt: new Date('2025-08-05T10:31:00Z'),
      },
      // Sneha: verified
      {
        userId: U_SNEHA,
        type: 'verification_result',
        payload: {
          result: 'approved',
          clubName: 'Robotics Club',
          dk24Status: 'verified',
        },
        readAt: new Date('2024-09-21T09:00:00Z'),
        createdAt: new Date('2024-09-20T14:10:00Z'),
      },
      // Rohan: verification failed
      {
        userId: U_ROHAN,
        type: 'verification_result',
        payload: {
          result: 'rejected',
          reason:
            'USN mismatch — submitted 1CS21CS088, club record has 1CS21CS099. Please resubmit with the correct USN.',
        },
        createdAt: new Date('2025-06-03T11:00:00Z'),
      },
      // Core admin: queue reminder for Kiran's pending request
      {
        userId: U_CORE,
        type: 'admin_queue_reminder',
        payload: {
          pendingCount: 1,
          oldestRequestAge: '7 days',
        },
        createdAt: new Date('2025-07-22T09:00:00Z'),
      },
    ])
    .onConflictDoNothing()

  console.log('\n✅  Seed complete!\n')
  console.log('  Users:                 10')
  console.log('  Clubs:                  3')
  console.log('  Recruiters:             2')
  console.log('  Student profiles:       5')
  console.log('  Postings:               4')
  console.log('  Applications:           6')
  console.log('  Club memberships:       7')
  console.log('  Verification requests:  5')
  console.log('  Notifications:          7')
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err)
  process.exit(1)
})
