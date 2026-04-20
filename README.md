# JuaKali Konnect

## What is JuaKali Konnect?
JuaKali Konnect is a platform that connects skilled Kenyan artisans ("fundis") with clients who need services like plumbing, welding, carpentry, and more. It helps local workers find jobs and makes it easy for people to hire trusted professionals.

## Features

### Authentication & User Accounts
- **Sign Up / Login**: Modal-based auth with email and password.
- **Role Selection**: Choose between a Client or Fundi account at registration.
- **Password Reset**: 6-digit demo verification code flow.
- **Persistent Sessions**: Accounts stored in `localStorage`. hence no backend required.
- **Role-Based Navigation**: Nav links adapt automatically (e.g. "Hire Fundis" becomes "Fundi Dashboard" for registered fundis).
- **Logout**: Clears session and redirects appropriately.

### Fundi Discovery & Search
- **Search for Fundis**: Find artisans by skill and location via the home page or the Hire Fundis page.
- **Smart Search Aliases**: Typing "carpenter" also matches carpentry/woodwork; "plumber" matches plumbing, etc.
- **Popular Services**: One-click tiles on the home page redirect to a pre-filtered search.
- **Quick Filters**: Filter by availability (Today / This Week), location (Nairobi), or budget (≤ KES 1,500).
- **Arrival Badge**: Shows the active search query when landing on the Hire Fundis page from a search.
- **Live Weather Banner**: Displays current Nairobi weather (via Open-Meteo API) to provide booking context.

### Worker Cards & Profiles
- **Fundi Profiles**: View star ratings, KES rate range, years of experience, availability, bio, and portfolio gallery.
- **Verified Badge**: Automatically shown for fundis with 8+ years of experience.
- **Availability Indicator**: Pulse dot for fundis available today.
- **Contact Options**: Direct WhatsApp deep-link (pre-filled message) and Call button on every profile.
- **Request Quote**: Send a quote request directly from a worker card or profile modal.
- **Card Animations**: Staggered entrance animations and 3D mouse-tilt parallax on hover.

### Fundi Dashboard
- **Profile Editor**: Update skill, experience, availability, service rate, and bio.
- **Portfolio Management**: Upload up to 8 portfolio photos with captions; remove individual items.
- **Leads List**: View incoming job requests; accept, decline, or respond with a custom quote (amount, timeline, notes).
- **Leads Summary**: Live count of new and active leads.
- **Onboarding Form**: First-time fundi registration with a skill category picker.
- **Role Guard**: Clients who visit the dashboard are redirected to their own profile page.

### Client Profile
- **Account Editor**: Update name, phone number, and location.
- **Profile Photo**: Upload a photo with live preview; falls back to a generated avatar.

### Secure Payments
- **M-Pesa Escrow Demo**: Simulate holding funds, marking work as complete, and releasing payment to the fundi.
- **STK Push Simulation**: Mimics the M-Pesa STK Push prompt flow.
- **Phone Normalisation**: Automatically formats Kenyan phone numbers to the correct MSISDN format.

## File Structure
```
index.html          — Home page
hireworkers.html    — Fundi search & listing
fundi-dashboard.html — Fundi profile & leads management
profile.html        — Client account page
aboutus.html        — About page
contactus.html      — Contact page
main.js             — All interactive features and animations
utils.js            — Shared pure utility functions
style.css           — Styles for the entire site including the matrix overlay
tests.js            — Zero-dependency Node.js unit test suite
tests.html          — Browser-runnable test page
```

## How to Use

### For Clients
1. Open `index.html` in your browser.
2. Search for a service from the home page or browse the Hire Fundis page.
3. Use quick filters or the search bar to narrow results.
4. Click a fundi card to view their full profile, then contact via WhatsApp, call, or quote request.
5. Use the Escrow Demo to simulate a payment.

### For Fundis
1. Sign up and select the **Fundi** role.
2. Complete your profile in the Fundi Dashboard (skill, rate, availability, photos).
3. Monitor and respond to leads from the dashboard.

## Running the Tests
```bash
node tests.js
```
All utility functions are covered by the test suite in `tests.js`. You can also open `tests.html` in a browser to run them there.

## Technologies Used
- **HTML5** — Page structure and semantics.
- **CSS3** — Styling, animations, and responsive layout.
- **Vanilla JavaScript** — All interactivity, no frameworks.
- **localStorage** — Client-side data persistence.
- **Open-Meteo API** — Live Nairobi weather data (no API key required).

## Setup
This is a fully static website — no server, build step, or dependencies required.
1. Download or clone the project files.
2. Open `index.html` in your web browser.
3. Navigate the site. 

## Contact
For questions, visit the Contact Us page or email info@juakalikonnect.com.

## License
© 2026 JuaKali Konnect. All rights reserved.
