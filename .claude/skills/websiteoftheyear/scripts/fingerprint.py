#!/usr/bin/env python3
"""Fingerprint a website's front-end stack: framework, motion/3D libraries,
smooth-scroll, page transitions, fonts, colour tokens, and asset weight.

Usage:  python3 -I fingerprint.py <url> [--json] [--max-scripts 25]

Fetches the HTML and up to N same-site JS/CSS files, then greps for library
signatures. Static fetch only: content injected later by JS can be missed, and
a bot wall (403/Cloudflare) shows up as "blocked". Standard library only.
"""
import json, re, ssl, sys, urllib.request, urllib.parse
from collections import Counter

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
CTX = ssl.create_default_context()
try:
    import certifi  # noqa
    CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    import os
    if os.path.exists("/etc/ssl/cert.pem"):
        CTX = ssl.create_default_context(cafile="/etc/ssl/cert.pem")

# name -> list of regexes (searched in HTML + JS + CSS, case-sensitive unless (?i))
SIGS = {
    # frameworks / builders
    "Next.js": [r"__NEXT_DATA__", r"/_next/static"],
    "Nuxt": [r"__NUXT__", r"/_nuxt/"],
    "Astro": [r"astro-island", r"/_astro/"],
    "SvelteKit": [r"__sveltekit", r"/_app/immutable/"],
    "Gatsby": [r"___gatsby"],
    "Remix": [r"__remixContext"],
    "Webflow": [r"data-wf-page", r"webflow\.js", r"website-files\.com"],
    "Framer": [r"framerusercontent\.com", r"__framer"],
    "WordPress": [r"wp-content/"],
    "Shopify": [r"cdn\.shopify\.com"],
    "Vue": [r"__vue_app__", r"data-v-[0-9a-f]{8}", r"createApp\("],
    "React": [r"react-dom", r"__reactFiber", r"_reactRoot"],
    # 3D / canvas
    "Three.js": [r"THREE\.WebGLRenderer", r"WebGLRenderer", r"three\.module", r"MeshStandardMaterial", r"REVISION\s*=\s*\"1\d\d"],
    "React Three Fiber": [r"@react-three/fiber", r"useFrame\(", r"R3F"],
    "OGL": [r"\bogl\b", r"new Renderer\(\{[^}]*dpr"],
    "PixiJS": [r"PIXI\.", r"pixi\.js", r"@pixi/"],
    "Babylon.js": [r"BABYLON\.", r"babylonjs"],
    "Spline": [r"spline\.design", r"@splinetool"],
    "Unicorn Studio": [r"unicorn\.studio", r"UnicornStudio"],
    "Raw WebGL/GLSL": [r"gl_FragColor", r"gl_Position", r"precision (?:highp|mediump) float"],
    "WebGPU": [r"navigator\.gpu", r"GPUDevice"],
    "Rapier/Cannon physics": [r"rapier", r"cannon-es", r"CANNON\."],
    "Draco/KTX2 compression": [r"DRACOLoader", r"KTX2Loader", r"draco_decoder"],
    "glTF models": [r"\.glb\b", r"\.gltf\b", r"GLTFLoader"],
    "Theatre.js": [r"@theatre/", r"theatre\.js"],
    # motion
    "GSAP": [r"gsap\.", r"GreenSock", r"TweenMax", r"gsap\.registerPlugin"],
    "GSAP ScrollTrigger": [r"ScrollTrigger"],
    "GSAP SplitText": [r"SplitText"],
    "GSAP Flip": [r"\bFlip\.(?:getState|from)"],
    "Framer Motion / Motion": [r"framer-motion", r"motion\.div", r"useScroll\(", r"motion-dom"],
    "anime.js": [r"anime\.js", r"anime\(\{"],
    "Lottie": [r"lottie", r"bodymovin"],
    "Rive": [r"@rive-app", r"\.riv\b"],
    "Matter.js": [r"Matter\.Engine"],
    "SplitType/Splitting": [r"SplitType", r"Splitting\("],
    # scroll / transitions
    "Lenis smooth scroll": [r"lenis", r"Lenis\("],
    "Locomotive Scroll": [r"locomotive-scroll", r"LocomotiveScroll"],
    "Barba.js transitions": [r"barba", r"data-barba"],
    "Swup transitions": [r"swup"],
    "Taxi.js transitions": [r"taxi\.js", r"data-taxi"],
    "Highway.js": [r"@dogstudio/highway", r"data-router-wrapper"],
    "View Transitions API": [r"startViewTransition", r"view-transition-name"],
    "CSS scroll-driven animation": [r"animation-timeline", r"scroll-timeline", r"view-timeline"],
    # media / audio
    "Howler/Web Audio": [r"howler", r"AudioContext"],
    "Background video": [r"<video[^>]*autoplay"],
    "Custom cursor": [r"(?i)cursor[-_]?(?:follower|dot|ball|circle)", r"cursor:\s*none"],
    "Preloader": [r"(?i)preloader|loader__|loading-screen"],
}

FONT_HOSTS = {
    "Google Fonts": r"fonts\.googleapis\.com", "Adobe Fonts/Typekit": r"use\.typekit\.net|p\.typekit\.net",
    "Fontshare": r"api\.fontshare\.com", "Self-hosted woff2": r"\.woff2",
}


def fetch(url, limit=6_000_000):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20, context=CTX) as r:
        return r.status, r.read(limit).decode("utf-8", "replace"), r.geturl()


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(1)
    url = args[0]
    as_json = "--json" in args
    max_scripts = int(args[args.index("--max-scripts") + 1]) if "--max-scripts" in args else 25
    out = {"url": url}
    try:
        status, html, final = fetch(url)
    except Exception as e:
        out["error"] = f"blocked or down: {e}"
        print(json.dumps(out, indent=2) if as_json else out["error"]); return
    out["final_url"], out["status"] = final, status
    host = urllib.parse.urlparse(final).netloc
    blob = [html]
    srcs = re.findall(r"""<script[^>]+src=["']([^"']+)""", html)
    srcs += re.findall(r"""<link[^>]+href=["']([^"']+\.(?:css|js)[^"']*)""", html)
    srcs += re.findall(r"""<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+)""", html)
    seen, sizes = set(), {}
    for s in srcs:
        full = urllib.parse.urljoin(final, s)
        if full in seen or len(seen) >= max_scripts:
            continue
        seen.add(full)
        try:
            _, body, _ = fetch(full)
            blob.append(body); sizes[full] = len(body)
        except Exception:
            sizes[full] = None
    text = "\n".join(blob)

    out["detected"] = sorted(n for n, pats in SIGS.items() if any(re.search(p, text) for p in pats))
    out["font_sources"] = [n for n, p in FONT_HOSTS.items() if re.search(p, text)]
    fams = re.findall(r"font-family:\s*['\"]?([A-Za-z0-9 \-]+)", text)
    fams += re.findall(r"family=([A-Za-z0-9+]+)", text)
    junk = {"inherit", "sans-serif", "serif", "monospace", "system-ui", "var", "initial", "-apple-system", "Arial", "Helvetica", "Times New Roman", "BlinkMacSystemFont", "Segoe UI", "Roboto"}
    out["font_families"] = [f for f, _ in Counter(x.strip().replace("+", " ") for x in fams if x.strip() not in junk).most_common(8)]
    hexes = Counter(h.lower() for h in re.findall(r"#[0-9a-fA-F]{6}\b", text))
    out["top_colors"] = [h for h, _ in hexes.most_common(10)]
    out["css_vars_sample"] = list(dict.fromkeys(re.findall(r"(--[a-zA-Z0-9\-]+):", text)))[:25]
    out["easings"] = [e for e, _ in Counter(re.findall(r"cubic-bezier\([^)]+\)|(?:power\d|expo|circ|back|elastic)\.(?:in|out|inOut)", text)).most_common(6)]
    out["title"] = (re.search(r"<title[^>]*>(.*?)</title>", html, re.S) or [None, ""])[1].strip()[:120]
    out["meta_description"] = (re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', html) or [None, ""])[1][:200]
    out["assets_fetched"] = len(seen)
    out["js_css_kb"] = round(sum(v for v in sizes.values() if v) / 1024)
    out["html_kb"] = round(len(html) / 1024)
    out["note"] = "static fetch; client-rendered content and lazy chunks may be missed"
    if as_json:
        print(json.dumps(out, indent=2))
    else:
        for k, v in out.items():
            print(f"{k:16} {v}")


if __name__ == "__main__":
    main()
