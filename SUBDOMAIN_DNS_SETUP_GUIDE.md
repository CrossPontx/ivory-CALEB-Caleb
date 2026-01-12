# Subdomain DNS Setup Guide for ivoryschoice.com

## Overview

Your nail tech website builder will create subdomains under your existing `ivoryschoice.com` domain:
- **Main site**: `ivoryschoice.com` (your current site)
- **Nail tech sites**: `sarah.ivoryschoice.com`, `maria.ivoryschoice.com`, etc.

## DNS Configuration

### Option 1: Wildcard Subdomain (Recommended)

Add a single DNS record that handles all subdomains:

```
Type: CNAME
Name: *
Value: ivoryschoice.com
TTL: 300 (5 minutes)
```

**Benefits:**
- ✅ Handles unlimited subdomains automatically
- ✅ No need to add DNS records for each nail tech
- ✅ Simple one-time setup

### Option 2: Individual Subdomains

Add DNS records for each nail tech individually:

```
Type: CNAME
Name: sarah
Value: ivoryschoice.com
TTL: 300

Type: CNAME  
Name: maria
Value: ivoryschoice.com
TTL: 300
```

**Benefits:**
- ✅ More control over individual subdomains
- ✅ Can point to different servers if needed

**Drawbacks:**
- ❌ Manual DNS record for each new nail tech
- ❌ More management overhead

## Implementation in Your App

### 1. Subdomain Detection

Your Next.js app needs to detect which subdomain is being accessed:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Check if it's a nail tech subdomain
  if (subdomain !== 'www' && subdomain !== 'ivoryschoice' && hostname.includes('ivoryschoice.com')) {
    // This is a nail tech website
    const url = request.nextUrl.clone();
    url.pathname = `/tech-website/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 2. Dynamic Tech Website Route

```typescript
// app/tech-website/[subdomain]/page.tsx
export default async function TechWebsitePage({ 
  params 
}: { 
  params: { subdomain: string } 
}) {
  // Load website data for this subdomain
  const websiteData = await getWebsiteBySubdomain(params.subdomain);
  
  if (!websiteData) {
    return <div>Website not found</div>;
  }
  
  // Render the v0-generated website
  return (
    <iframe 
      src={websiteData.demoUrl}
      className="w-full h-screen"
      frameBorder="0"
    />
  );
}
```

### 3. Database Query

```typescript
// lib/website-queries.ts
export async function getWebsiteBySubdomain(subdomain: string) {
  const [website] = await db
    .select()
    .from(techWebsites)
    .where(eq(techWebsites.subdomain, subdomain))
    .limit(1);
    
  return website;
}
```

## SSL Certificate Setup

### Automatic SSL with Vercel

If you're hosting on Vercel:

1. **Add Domain to Vercel**:
   ```bash
   vercel domains add ivoryschoice.com
   vercel domains add *.ivoryschoice.com
   ```

2. **Vercel handles SSL automatically** for all subdomains

### Manual SSL with Let's Encrypt

If self-hosting:

```bash
# Install certbot
sudo apt install certbot

# Get wildcard certificate
sudo certbot certonly --manual --preferred-challenges=dns \
  -d ivoryschoice.com -d *.ivoryschoice.com
```

## Testing Subdomains Locally

### 1. Update /etc/hosts (Mac/Linux)

```bash
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 sarah.ivoryschoice.local
127.0.0.1 maria.ivoryschoice.local
127.0.0.1 test.ivoryschoice.local
```

### 2. Update Next.js Config

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>.*)\\.ivoryschoice\\.local',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 3. Test Locally

```bash
# Start your dev server
yarn dev

# Test in browser:
# http://sarah.ivoryschoice.local:3000
# http://maria.ivoryschoice.local:3000
```

## Production Deployment

### 1. DNS Provider Setup

**Cloudflare (Recommended)**:
- Add wildcard CNAME: `* → ivoryschoice.com`
- Enable "Proxy status" for DDoS protection
- SSL/TLS mode: "Full (strict)"

**Other Providers**:
- Add wildcard CNAME in your DNS panel
- Point to your hosting server IP

### 2. Server Configuration

**Nginx Example**:
```nginx
server {
    listen 80;
    server_name *.ivoryschoice.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Cost Breakdown

### ✅ No Additional Costs for You:
- **Subdomains**: Free (unlimited)
- **SSL Certificates**: Free (Let's Encrypt/Vercel)
- **DNS**: Included with your domain

### 💰 When Nail Techs Want Custom Domains:
- **They buy**: `sarahnails.com` (~$12/year)
- **They pay**: Pro plan subscription ($19/month)
- **You provide**: DNS instructions and SSL setup

## Security Considerations

### 1. Subdomain Isolation
```typescript
// Ensure each subdomain only accesses its own data
export async function getWebsiteData(subdomain: string, userId: number) {
  // Verify user owns this subdomain
  const website = await db
    .select()
    .from(techWebsites)
    .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
    .where(
      eq(techWebsites.subdomain, subdomain) &&
      eq(techProfiles.userId, userId)
    );
    
  return website;
}
```

### 2. Rate Limiting
```typescript
// Prevent abuse of subdomain creation
const subdomainCreationLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 website per day per user
});
```

## Summary

✅ **Use your existing `ivoryschoice.com` domain**  
✅ **No need to buy `ivory.app`**  
✅ **Unlimited subdomains for free**  
✅ **Professional URLs**: `sarah.ivoryschoice.com`  
✅ **Easy DNS setup**: One wildcard CNAME record  
✅ **Automatic SSL**: Handled by your hosting provider  

Your nail techs get professional websites under your established brand, and you don't pay any additional domain costs!