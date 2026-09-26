# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Suiryu sendiri, yang membangun ini untuk belajar React, Tailwind CSS, dan TypeScript, sekaligus sebagai proyek portofolio. Pembaca kedua: orang yang menilai portofolio (recruiter, reviewer) dan membuka app sebentar untuk mencoba cari kota.

## Product Purpose
Menjawab "cuacanya sekarang gimana di kota X / di sini" dalam satu layar. Berhasil kalau jawabannya terbaca sekilas dan kodenya cukup rapi untuk dipamerkan.

## Positioning
Suasana tampilan ikut cuaca: kondisi (cerah, berawan, kabut, hujan, salju, badai) dan siang/malam di lokasi itu mengubah nuansa seluruh layar, bukan hanya ikon.

## Capabilities and Constraints
- Data: Open-Meteo (forecast + geocoding), tanpa API key, tanpa backend.
- v1: cari kota, cuaca sekarang (suhu, terasa seperti, kelembapan, angin, kondisi), lokasi saya via geolocation, favorit dan terakhir dicari di localStorage.
- Satuan metrik (°C, km/h). UI bahasa Inggris.
- Belum masuk v1: prakiraan per jam/harian, toggle °C/°F.
- Open-Meteo tidak punya reverse geocoding, jadi lokasi dari geolocation diberi label "My location".
- Deploy belum ditentukan; git hanya lokal untuk sekarang.

## Evidence on Hand
Tidak ada aset brand, logo, atau konten selain data cuaca live. Jangan mengarang testimoni atau klaim.

## Product Principles
- Jawaban dulu: suhu dan kondisi adalah hal pertama yang terbaca.
- Nuansa adalah informasi: perubahan tampilan harus mencerminkan cuaca sebenarnya.
- Kode sebagai bahan belajar: idiomatis, sedikit abstraksi, mudah dibaca.

## Accessibility & Inclusion
Kontras teks minimal WCAG AA di semua kombinasi cuaca dan tema, bisa dipakai penuh dengan keyboard, hormati prefers-reduced-motion.
