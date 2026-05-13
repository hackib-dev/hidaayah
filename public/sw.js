if (!self.define) {
  let e,
    a = {};
  const s = (s, i) => (
    (s = new URL(s + '.js', i).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (i, c) => {
    const n = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (a[n]) return;
    let t = {};
    const r = (e) => s(e, n),
      o = { module: { uri: n }, exports: t, require: r };
    a[n] = Promise.all(i.map((e) => o[e] || r(e))).then((e) => (c(...e), t));
  };
}
define(['./workbox-f1770938'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/XwIcgpI4VUGLGCDKJiGwY/_buildManifest.js',
          revision: 'fba5b0047ffd2ff1768f05e0c1acef14'
        },
        {
          url: '/_next/static/XwIcgpI4VUGLGCDKJiGwY/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933'
        },
        { url: '/_next/static/chunks/2721-793c575f055ce041.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/30-d46087132fc1e336.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/344-eadfc7a1389cb998.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/3464-278b417a00b47e26.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/4277-e122a3c622957de0.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/4861-2d9bb2f5ed7ef47d.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        {
          url: '/_next/static/chunks/4bd1b696-22ad6b3d588a97da.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        { url: '/_next/static/chunks/5180-9ee32679f8982728.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/5724-0879a7747eaf07f2.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/6874-de69b729bd631348.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/7420-efa7b5f25c9dcb00.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        { url: '/_next/static/chunks/8200-d7881bc50e2d6c0f.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/bookmarks/page-f358a0fabe7573af.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/circles/page-95877964faf54b89.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/collections/%5Btheme%5D/page-293260897ff69c1b.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/collections/error-b9528cc28650c1e4.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/collections/loading-cee32d65de6ad702.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/collections/page-a53abde0d5e276d7.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/goals/page-ae01377add0e1744.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/guidance/error-b552da58187736cc.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/guidance/loading-d9557a65ea99f908.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/guidance/page-f51110bcfa63c1f2.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/page-aeacfa2894e5d3ce.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/profile/%5Btab%5D/page-215af275e7018d3a.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/profile/loading-2a1d1951252682c3.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/profile/page-73e36d730da9c004.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/quran/error-63e4cd1c8fc231a1.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/quran/loading-c7963868f7e1d8eb.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/quran/page-877f9d7c592ed44f.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/reflections/error-6c1938e642c61fc7.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/reflections/loading-a768a48ec6d573de.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/dashboard/reflections/page-e62c1c53aa75a223.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/(app)/layout-0aac906e3e746a00.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-fce266572610d691.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/api/auth/logout/route-33ab5866ca2b8d31.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/api/auth/token/route-69d3a9a4c82d2c3f.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/api/guidance/suggest/route-41e808c59f203846.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/api/qf/%5B...path%5D/route-75c2d7edeb6b8745.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/callback/page-21b956612956b781.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/error-137f30cd85136a40.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/layout-ffe3b3a746aaec1d.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/loading-5b062be9509c692f.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/login/page-177b1b3d7f697feb.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/not-found-c0a134daef46e30e.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/page-4163a3876183055c.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/privacy/page-5e41e861f3593853.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/signup/page-c75c16126e4ea4a4.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/app/terms/page-ea331734a8deeed7.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/framework-1c0b3659d329980b.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        { url: '/_next/static/chunks/main-3ad8e05810210a93.js', revision: 'XwIcgpI4VUGLGCDKJiGwY' },
        {
          url: '/_next/static/chunks/main-app-813b998408ea04b0.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/pages/_app-eb694f3fd49020c8.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/pages/_error-2b3482c094a540b4.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f'
        },
        {
          url: '/_next/static/chunks/webpack-f5d13426fc764a2a.js',
          revision: 'XwIcgpI4VUGLGCDKJiGwY'
        },
        { url: '/_next/static/css/020df9dd827d8bef.css', revision: '020df9dd827d8bef' },
        { url: '/_next/static/css/39755abe30a97541.css', revision: '39755abe30a97541' },
        {
          url: '/_next/static/media/28a2004cf8372660-s.woff2',
          revision: 'a81e6c6c3493caf3463c36f633996e92'
        },
        {
          url: '/_next/static/media/47f136985ef5b5cb-s.woff2',
          revision: '62f762afb90d7743f6916ea0cce473af'
        },
        {
          url: '/_next/static/media/4ead58c4dcc3f285-s.woff2',
          revision: '774586d4bcb09cb42f38fc490d25b01b'
        },
        {
          url: '/_next/static/media/5aae3a1c1074c5e1-s.p.woff2',
          revision: 'bd662c02bb48a6acc80e8a0ed015faa8'
        },
        {
          url: '/_next/static/media/636a5ac981f94f8b-s.p.woff2',
          revision: '52d04440a9faae0db9adc6cdc844099b'
        },
        {
          url: '/_next/static/media/6fe53d21e6e7ebd8-s.woff2',
          revision: '2591db816b61d44b6e87ba79d13622b2'
        },
        {
          url: '/_next/static/media/8c2fd50d66d22a18-s.p.woff2',
          revision: 'cea212934e8714595307115a6b889450'
        },
        {
          url: '/_next/static/media/8ebc6e9dde468c4a-s.woff2',
          revision: '196acbb650c75807ea2f0ef36edbd186'
        },
        {
          url: '/_next/static/media/9c79641216ce8622-s.woff2',
          revision: '64001b31bd65eaf2517849769d238692'
        },
        {
          url: '/_next/static/media/9e7b0a821b9dfcb4-s.woff2',
          revision: '5ffe46eeb00dd9fa8a70cb10ccc3817e'
        },
        {
          url: '/_next/static/media/da6e5417d357d163-s.p.woff2',
          revision: 'dcbe32484b7cdc076ca2dc7e7b04df6d'
        },
        {
          url: '/_next/static/media/dd5f2241e050216b-s.p.woff2',
          revision: 'a5e2ba3207c491e457dde29e899d7a8a'
        },
        {
          url: '/_next/static/media/eaead17c7dbfcd5d-s.p.woff2',
          revision: '6da252de0cbc8a69b5d5c2e0e3f67722'
        },
        {
          url: '/_next/static/media/ecb0c194634e5a7f-s.woff2',
          revision: 'c417e9b8780fef87c0f58a4035b38351'
        },
        { url: '/fonts/Euclid_Circular_Bold.ttf', revision: 'c9c7790611487f10ab2d674f6a8909d6' },
        { url: '/fonts/Euclid_Circular_Italic.ttf', revision: '77ab61abcedb5a343e5ab0e1fb3edd7b' },
        { url: '/fonts/Euclid_Circular_Light.ttf', revision: '54330d7091c1d3d05f033a08b7fb9950' },
        { url: '/fonts/Euclid_Circular_Medium.ttf', revision: 'f27978ebb847738736f0bc1b76a96c0e' },
        { url: '/fonts/Euclid_Circular_Regular.ttf', revision: 'e191fa05c7960306760e908cc169f28b' },
        {
          url: '/fonts/Euclid_Circular_SemiBold.ttf',
          revision: '1fd0745bac683551717ebb18a78ef5eb'
        },
        { url: '/icons/favicon.svg', revision: '3802c42bd566cd334ca018490174ad17' },
        { url: '/icons/icon-192.svg', revision: '31e2bac4afe958015464e7aaa920c037' },
        { url: '/icons/icon-192x192.png', revision: '61de8580a3388d612541b5c1b6f06c33' },
        { url: '/icons/icon-512.svg', revision: 'a8987a707a0a3fb21a7f981ecbe70c6f' },
        { url: '/icons/icon-512x512.png', revision: '7113c583e5577ed03eef9117067ba67f' },
        { url: '/manifest.json', revision: 'b47bc26a2b4dbb133d4c04934f04c53d' },
        { url: '/placeholder-user.jpg', revision: '7ee6562646feae6d6d77e2c72e204591' },
        { url: '/placeholder.jpg', revision: '1e533b7b4545d1d605144ce893afc601' },
        { url: '/placeholder.svg', revision: '35707bd9960ba5281c72af927b79291f' }
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: function (e) {
              return _ref.apply(this, arguments);
            }
          }
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: 'next-static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
        ]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var a = e.sameOrigin,
          s = e.url.pathname;
        return !(!a || s.startsWith('/api/auth/callback') || !s.startsWith('/api/'));
      },
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var a = e.request,
          s = e.url.pathname,
          i = e.sameOrigin;
        return (
          '1' === a.headers.get('RSC') &&
          '1' === a.headers.get('Next-Router-Prefetch') &&
          i &&
          !s.startsWith('/api/')
        );
      },
      new e.NetworkFirst({
        cacheName: 'pages-rsc-prefetch',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var a = e.request,
          s = e.url.pathname,
          i = e.sameOrigin;
        return '1' === a.headers.get('RSC') && i && !s.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'pages-rsc',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        var a = e.url.pathname;
        return e.sameOrigin && !a.startsWith('/api/');
      },
      new e.NetworkFirst({
        cacheName: 'pages',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
      }),
      'GET'
    ),
    e.registerRoute(
      function (e) {
        return !e.sameOrigin;
      },
      new e.NetworkFirst({
        cacheName: 'cross-origin',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })]
      }),
      'GET'
    ));
});
