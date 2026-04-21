# Project Specification: AI-Integrated Autonomous LMS

## Overview
A high-end, autonomous online learning management system (LMS) built with a focus on security (DRM), automated payments, and premium aesthetics.

## Technology Stack
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Vanilla CSS (Premium Aesthetics: Bento Grid, Glassmorphism)
- **Backend/Database**: Supabase (Auth, PostgreSQL)
- **Email**: Resend
- **Payment**: VNPay / MoMo
- **Video Security**: Custom DRM with Dynamic Watermarking

## Data Model

### Users
- `id`: uuid (PK, Supabase Auth)
- `email`: string (unique)
- `role`: string (admin, student)
- `created_at`: timestamp

### Courses
- `id`: uuid (PK)
- `title`: string
- `description`: text
- `price`: numeric
- `instructor_id`: uuid (FK to Users.id)
- `created_at`: timestamp

### Lessons
- `id`: uuid (PK)
- `course_id`: uuid (FK to Courses.id)
- `title`: string
- `video_provider_id`: string (DRM ID)
- `order_index`: integer
- `content`: text (optional)

### Enrollments
- `user_id`: uuid (FK to Users.id)
- `course_id`: uuid (FK to Courses.id)
- `status`: string (active, expired)
- `enrolled_at`: timestamp
- Primary Key: (user_id, course_id)

### Payments
- `id`: uuid (PK)
- `order_id`: string (VNPay/MoMo order ID)
- `user_id`: uuid (FK to Users.id)
- `course_id`: uuid (FK to Courses.id)
- `amount`: numeric
- `transaction_id`: string
- `status`: string (pending, success, failed)
- `created_at`: timestamp

## Design Guidelines
- **Bento Grid Layout**: Rounded corner blocks for content organization.
- **Functional Minimalism**: Clean UI, no clutter.
- **Glassmorphism**: Liquid glass effects for depth.
- **Micro-interactions**: Subtle hover states and transitions.
- **Brand Voice**: Professional, inspiring, and direct.

## Feature Roadmap
1. [ ] Project Initialization (Next.js + Supabase)
2. [ ] Auth & User Management
3. [ ] Course & Lesson Management (Admin)
4. [ ] DRM Video Integration with Watermarking
5. [ ] Automated Payment Gateway (VNPay)
6. [ ] Email Automation (Resend)
7. [ ] SEO & Analytics Optimization
