This is a comprehensive Design System and Design Language documentation based on the Flowpay visual identity. You can provide this directly to an AI coding assistant (like Claude Code) or a developer to replicate the exact look and feel of the provided landing page.

Invest.me Design System v1.0
1. Design Philosophy & Vibe

Keywords: Modern, Fintech, Trustworthy, "Glass & Clay", Clean, Geometric.

Visual Style: A mix of Bento Grid layouts, 3D Clay/Glassmorphism elements, and high-contrast typography.

Theme: Dual-theme usage. The visual language uses a "Dark Mode" aesthetic for the Hero and CTA sections (Deep Navy/Teal) and a "Light Mode" aesthetic for the Features and Social Proof sections (White/Light Grey).

2. Color Palette

Define these as CSS variables (root) or Tailwind config colors.

Primary Colors

--navy-900 (Background/Text): #051019 (Deepest Navy, almost black)

--navy-800 (Hero Background): #0B1C2E (Rich Deep Blue-Green)

--navy-700 (Accents/Strokes): #15283D

--lime-400 (Primary Accent/Action): #D4F358 (Vibrant Lime Green)

--lime-500 (Hover State): #C2E04A

Neutral Colors

--white: #FFFFFF

--grey-50 (Section Background): #F9FAFB

--grey-100 (Card Background): #F3F4F6

--grey-400 (Subtext): #9CA3AF

--grey-600 (Body Text): #4B5563

--grey-900 (Headings): #111827

Gradients

Hero Glow: Radial gradient from Top-Left: radial-gradient(circle at 0% 0%, rgba(21, 56, 76, 0.4) 0%, transparent 50%)

Card Shine: Linear gradient overlay for 3D cards: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)

3. Typography

Font Family: Plus Jakarta Sans or Manrope (Google Fonts). These are geometric sans-serifs that match the modern fintech look.

Display (Hero H1):

Weight: 500 (Medium) - The hero text is large but not bold.

Size: 4rem to 5rem (64px - 80px).

Line-height: 1.1.

Color: --white.

Heading H2 (Section Titles):

Weight: 500 (Medium).

Size: 2.5rem (40px).

Line-height: 1.2.

Color: --navy-900 (Light sections) or --white (Dark sections).

Heading H3 (Feature Cards):

Weight: 500 (Medium).

Size: 1.5rem (24px).

Color: --navy-900.

Body Text:

Weight: 400 (Regular).

Size: 1rem to 1.125rem (16px - 18px).

Color: --grey-600 (Light sections) or --grey-400 (Dark sections).

Labels/Nav:

Weight: 500 (Medium).

Size: 0.95rem (15px).

4. Component Library
A. Buttons

Primary Button (Lime):

Background: --lime-400

Text Color: --navy-900

Shape: Full Pill (border-radius: 9999px)

Padding: 12px 28px

Font Weight: 600

Effect: Slight drop shadow on hover.

Secondary/Icon Button:

Background: --white

Icon Color: --navy-900

Shape: Circle (width: 48px, height: 48px)

Content: Diagonal arrow icon (↗).

Ghost/Nav Button:

Background: Transparent

Text Color: --white (Hero) or --navy-900 (Footer)

Hover: Text decoration underline or opacity drop.

B. Cards & Containers

Border Radius: Highly rounded. Use 24px or 32px for feature cards.

Feature Card (Light Theme):

Background: --grey-50 or white

Border: None usually, or extremely subtle --grey-200.

Shadow: Soft diffuse shadow box-shadow: 0 4px 20px rgba(0,0,0,0.05).

Bento Grid Layout (Section 3):

A CSS Grid layout with varying column spans.

Gaps: 24px.

C. Visual Effects & Graphics

Grid Overlay (Hero & CTA):

A subtle 1px grid line pattern overlaid on the dark background.

Opacity: 5-10%.

3D Icons (Claymorphism):

Used in the "Mission" section (Lock, Lightning).

Style: White/Grey monochromatic 3D renders with soft ambient occlusion.

Glass Cards (Hero Image):

The credit cards in the hero section have a frosted glass effect (backdrop-filter: blur(10px)).

5. Detailed Section Breakdown
Section 1: Navigation (Navbar)

Position: Fixed or Absolute Top.

Background: Transparent.

Logo: White text "Flowpay" with a Lime Green graphical 'F' logo.

Links: Centered. "Home", "Integrations", "Features", "Services". Small icons next to text (optional).

CTA: White pill button "Sign In" with a black icon.

Section 2: Hero (Image 1)

Background: Dark Navy Gradient + Grid Overlay.

Left Column (Text):

"Solutions for tomorrow" badge (Outline stroke, rounded pill).

H1: "Empower Your Financial Journey with Flowpay".

Subtext: Grey-blue.

Action Group: "Get Started Today" (Lime Button) + Arrow Circle Button.

Trust Badges: Row of monochrome logos (Visa, Stripe, OVO, PayPal) at the very bottom.

Right Column (Visual):

3D Isometric composition.

Frosted glass credit cards floating over dark green/abstract shapes.

Section 3: Mission/Values (Image 2)

Background: White.

Layout: Two large equal-width columns/cards.

Card Style:

Top: Large 3D Icon (Padlock for Security, Lightning for Speed).

Middle: H2 Headline ("Secure Your Future", "Empower with Speed").

Bottom: Paragraph text + Lime Green "See Details" pill button with right arrow.

Section 4: Features Bento Grid (Image 3)

Headline: Centered, large. "Experience seamless integration..."

Grid Layout (3 rows, mixed columns):

Row 1 Left: "Effortless Transactions". Visual: Overlapping payment notification toasts (Glass effect).

Row 1 Right: "Community-Based Platform". Visual: 3D wireframe globe/people.

Row 2 Left: "Trust Financial". Visual: Simple grid background.

Row 2 Center: "Performance Analytics". Visual: Bar chart graph + floating "$78 M" tag.

Row 2 Right: "Seamless Access". Visual: Dotted map with user avatars.

Note: All cards have light grey backgrounds and rounded corners.

Section 5: Social Proof & Stats (Image 4)

Testimonial: Top section.

Tag: "Testimonial" (Pill).

Quote: Large, clean font. "I've used other financial platforms..."

Author: "Jane Doe" (Lime Green text).

Stats Row:

"200K" (Join a community...), "4.9+" (Ratings), "98%" (Report satisfaction).

Numbers are huge, Dark Navy.

Logo Row: High contrast logos (Visa, Wise, Stripe, OVO, PayPal, Apple Pay).

Section 6: Bottom CTA (Image 4 Bottom)

Style: Reverts to Hero Dark Theme.

Background: Dark Navy + Grid Overlay.

Content:

"Solutions for tomorrow" tag.

H2: "Ready to Take Control?"

Subtext: "Unlock smarter, faster..."

Button: Centered, Lime Green "Schedule A Demo".

Section 7: Footer (Image 5)

Background: White.

Layout: 5 Columns.

Col 1: Brand. Logo, Address, Support Email, Social Icons (Instagram, LinkedIn, X - large black outlined icons).

Cols 2-5: Link Lists (About Us, Services, Solutions, Community).

Bottom Bar: Copyright text + "Privacy and Policy". Simple border-top separation.

6. Implementation Notes for Claude Code

CSS Grid: Use CSS Grid extensively for the "Features" section to get the Bento box alignment perfect.

Tailwind Suggestions:

Use rounded-3xl for cards.

Use bg-slate-900 for dark backgrounds.

Use text-lime-400 for accents.

Use backdrop-blur-md for glass effects.

Responsiveness: The Bento grid should stack vertically on mobile. The Hero section should stack image-under-text on mobile.