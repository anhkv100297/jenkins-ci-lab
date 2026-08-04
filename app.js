const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CI/CD Deployment Status</title>
      <!-- Tailwind CSS qua CDN -->
      <script src="https://cdn.tailwindcss.com"></script>
      <!-- Font Inter chuẩn thiết kế tối giản Apple -->
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body class="bg-[#f5f5f7] text-[#1d1d1f] antialiased min-h-screen flex items-center justify-center p-6">
      
      <!-- Main Card - Glassmorphism tối giản -->
      <div class="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 text-center transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
        
        <!-- Status Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-6">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Operational
        </div>

        <!-- Headline -->
        <h1 class="text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-3">
         CI/CD Deployment
        </h1>
        
        <!-- Subtitle Gradient -->
        <p class="text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-medium mb-8">
          Pipeline Deployed Successfully
        </p>

        <!-- Tech Stack Chips -->
        <div class="pt-6 border-t border-gray-100 flex justify-center items-center gap-3 text-xs text-gray-500 font-medium">
          <span class="px-3 py-1 bg-gray-100 rounded-lg">Jenkins</span>
          <span>•</span>
          <span class="px-3 py-1 bg-gray-100 rounded-lg">Docker</span>
          <span>•</span>
          <span class="px-3 py-1 bg-gray-100 rounded-lg">AWS EC2</span>
        </div>

      </div>

    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Application running at port ${port}`);
});
